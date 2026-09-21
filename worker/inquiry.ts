import {
  inquirySchema,
  fieldErrors,
  validateFiles,
  hasValidImageSignature,
  MAX_BODY_BYTES,
} from "../src/lib/inquiry";
import type { Env } from "./index";

const json = (
  body: unknown,
  status = 200,
  extra: Record<string, string> = {},
) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra,
    },
  });
class BodyLimitError extends Error {}
async function readBody(request: Request): Promise<ArrayBuffer> {
  const length = request.headers.get("Content-Length");
  if (length && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES))
    throw new BodyLimitError();
  if (!request.body) throw new Error("Missing body");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timedOut = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      void reader.cancel();
      reject(new Error("Body timeout"));
    }, 10000);
  });
  try {
    while (true) {
      const { value, done } = await Promise.race([reader.read(), timedOut]);
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) throw new BodyLimitError();
      chunks.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return bytes.buffer;
  } finally {
    clearTimeout(timeout);
    await reader.cancel().catch(() => {});
  }
}
async function hash(value: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function base64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
function configured(env: Env): boolean {
  return Boolean(
    env.SITE_URL &&
    env.RESEND_API_KEY &&
    env.INQUIRY_TO_EMAIL &&
    env.INQUIRY_FROM_EMAIL &&
    env.TURNSTILE_SECRET_KEY &&
    env.INQUIRY_RATE_LIMITER &&
    env.EMAIL_RATE_LIMITER,
  );
}

export async function handleCommission(
  request: Request,
  env: Env,
  send: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST")
    return json({ message: "Use POST to send an inquiry." }, 405, {
      Allow: "POST",
    });
  if (env.INQUIRIES_ENABLED !== "true" || !configured(env))
    return json(
      {
        message:
          "The inquiry form is not taking submissions yet. Please try again later.",
      },
      503,
    );
  let site: URL;
  try {
    site = new URL(env.SITE_URL!);
  } catch {
    return json(
      { message: "The inquiry form is temporarily unavailable." },
      503,
    );
  }
  // The host check also disables this production-configured Worker on version-preview URLs.
  if (
    request.headers.get("Origin") !== site.origin ||
    new URL(request.url).origin !== site.origin
  )
    return json({ message: "Please submit the form from the website." }, 403);
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) return json({ message: "Unable to verify this request." }, 403);
  try {
    const limited = await env.INQUIRY_RATE_LIMITER.limit({
      key: await hash(`ip:${ip}`),
    });
    if (!limited.success)
      return json(
        { message: "Please wait a minute before trying again." },
        429,
        { "Retry-After": "60" },
      );
  } catch {
    return json(
      { message: "The inquiry form is temporarily unavailable." },
      503,
    );
  }
  const type = request.headers.get("Content-Type") || "";
  if (!type.toLowerCase().startsWith("multipart/form-data;"))
    return json({ message: "Please submit using the inquiry form." }, 415);
  let form: FormData;
  try {
    form = await new Response(await readBody(request), {
      headers: { "Content-Type": type },
    }).formData();
  } catch (error) {
    return json(
      {
        message:
          error instanceof BodyLimitError
            ? "Your images are too large. Please keep uploads under 5 MB in total."
            : "The form could not be read. Please try again.",
      },
      error instanceof BodyLimitError ? 413 : 400,
    );
  }
  const allowed = [
    "name",
    "email",
    "workType",
    "idea",
    "colors",
    "size",
    "budget",
    "website",
    "startedAt",
    "submissionId",
    "cf-turnstile-response",
    "images",
  ];
  for (const key of form.keys())
    if (
      !allowed.includes(key) ||
      (key !== "images" &&
        (form.getAll(key).length !== 1 || typeof form.get(key) !== "string"))
    )
      return json({ message: "The form contains invalid fields." }, 400);
  if (String(form.get("website") || "").trim())
    return json(
      { message: "The inquiry could not be verified. Please try again." },
      400,
    );
  const started = Number(form.get("startedAt"));
  if (
    !Number.isFinite(started) ||
    Date.now() - started < 2000 ||
    Date.now() - started > 86400000
  )
    return json(
      { message: "Please take a moment to review the form, then try again." },
      400,
    );
  const id = form.get("submissionId");
  if (
    typeof id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    )
  )
    return json({ message: "Please reload the page before submitting." }, 400);
  const token = form.get("cf-turnstile-response");
  if (typeof token !== "string" || !token || token.length > 2048)
    return json(
      {
        message: "Please complete the verification.",
        errors: { verification: "Please complete the verification." },
      },
      400,
    );
  const fields = Object.fromEntries(
    ["name", "email", "workType", "idea", "colors", "size", "budget"].map(
      (key) => [key, form.get(key) ?? ""],
    ),
  );
  const parsed = inquirySchema.safeParse(fields);
  if (!parsed.success)
    return json(
      {
        message: "Please check the highlighted fields.",
        errors: fieldErrors(parsed.error),
      },
      400,
    );
  const uploads = form.getAll("images");
  if (uploads.some((f) => typeof f === "string"))
    return json(
      {
        message: "Invalid image upload.",
        errors: { images: "Please choose image files." },
      },
      400,
    );
  const files = (uploads as File[]).filter((f) => f.name !== "" || f.size > 0);
  const imageError = validateFiles(files);
  if (imageError)
    return json({ message: imageError, errors: { images: imageError } }, 400);
  if (
    (await Promise.all(files.map(hasValidImageSignature))).some(
      (valid) => !valid,
    )
  )
    return json(
      {
        message: "An image does not match its file type.",
        errors: { images: "Please use original JPEG, PNG, or WebP images." },
      },
      400,
    );
  try {
    if (
      !(
        await env.EMAIL_RATE_LIMITER.limit({
          key: await hash(`email:${parsed.data.email}`),
        })
      ).success
    )
      return json(
        { message: "Please wait a minute before sending another inquiry." },
        429,
        { "Retry-After": "60" },
      );
    const verified = await send(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: ip,
        }),
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!verified.ok)
      return json(
        {
          message: "Verification is temporarily unavailable. Please try again.",
        },
        503,
      );
    const result = (await verified.json()) as {
      success?: boolean;
      hostname?: string;
      action?: string;
    };
    if (
      !result.success ||
      result.hostname !== site.hostname ||
      result.action !== "commission"
    )
      return json(
        {
          message: "Please complete a new verification and try again.",
          errors: {
            verification: "Verification expired or could not be confirmed.",
          },
        },
        400,
      );
    const inquiry = parsed.data;
    const attachments = await Promise.all(
      files.map(async (file, i) => ({
        filename: `inspiration-${i + 1}.${file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp"}`,
        content: base64(await file.arrayBuffer()),
      })),
    );
    const payload = {
      from: env.INQUIRY_FROM_EMAIL,
      to: [env.INQUIRY_TO_EMAIL],
      reply_to: inquiry.email,
      subject: `New commission inquiry: ${inquiry.workType}`,
      text: [
        `Name: ${inquiry.name}`,
        `Email: ${inquiry.email}`,
        `Work requested: ${inquiry.workType}`,
        "",
        inquiry.idea,
        "",
        `Preferred colors: ${inquiry.colors || "Not specified"}`,
        `Approximate size: ${inquiry.size || "Not specified"}`,
        `Budget: ${inquiry.budget || "Not specified"}`,
      ].join("\n"),
      ...(attachments.length ? { attachments } : {}),
    };
    const body = JSON.stringify(payload);
    // Stable key for an explicit retry of this submission. No automatic email retries.
    const key = await hash(`${id}:${body}`);
    const email = await send("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `commission/${key}`,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });
    if (!email.ok)
      return json(
        {
          message:
            "We could not confirm delivery. Your form is still here; please try again shortly.",
        },
        502,
      );
    const receipt = (await email.json()) as { id?: string };
    if (!receipt.id)
      return json(
        { message: "We could not confirm delivery. Please try again shortly." },
        502,
      );
    return json({
      message: "Your inquiry has been sent. Thank you for sharing your idea.",
    });
  } catch {
    return json(
      {
        message:
          "We could not confirm delivery. Please check your connection and try again shortly.",
      },
      503,
    );
  }
}
