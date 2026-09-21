import { describe, it, expect, vi } from "vitest";
import { handleCommission } from "../worker/inquiry";
import { inquirySchema, MAX_BODY_BYTES } from "../src/lib/inquiry";
import type { Env } from "../worker/index";

const good = {
  name: "Taylor Visitor",
  email: "TAYLOR@example.com",
  workType: "Mosaic surfboard",
  idea: "I would love a mosaic inspired by a quiet coastal sunset.",
  colors: "Blue and ivory",
  size: "About 36 inches",
  budget: "I’d like to discuss",
  website: "",
  startedAt: String(Date.now() - 10000),
  submissionId: "12345678-1234-4123-8123-123456789abc",
  "cf-turnstile-response": "valid-test-token",
};
const env = (): Env => ({
  ASSETS: { fetch: vi.fn() },
  INQUIRY_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
  EMAIL_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
  SITE_URL: "https://artist.example",
  INQUIRIES_ENABLED: "true",
  TURNSTILE_SECRET_KEY: "test-secret",
  RESEND_API_KEY: "test-email-key",
  INQUIRY_FROM_EMAIL: "studio@artist.example",
  INQUIRY_TO_EMAIL: "owner@artist.example",
});
function request(
  fields: Record<string, string> = {},
  files: File[] = [],
  origin = "https://artist.example",
) {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    ...good,
    startedAt: String(Date.now() - 10000),
    ...fields,
  }))
    form.append(key, value);
  for (const file of files) form.append("images", file);
  return new Request("https://artist.example/api/commissions", {
    method: "POST",
    headers: { Origin: origin, "CF-Connecting-IP": "192.0.2.1" },
    body: form,
  });
}
function provider() {
  return vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      Response.json({
        success: true,
        hostname: "artist.example",
        action: "commission",
      }),
    )
    .mockResolvedValueOnce(Response.json({ id: "email-accepted" }));
}
function png(size = 20) {
  const bytes = new Uint8Array(size);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10]);
  return new File([bytes], "reference.png", { type: "image/png" });
}

describe("inquiry fields", () => {
  it("normalizes the email address", () =>
    expect(inquirySchema.parse(good).email).toBe("taylor@example.com"));
  it.each([
    { email: "bad address" },
    { name: "A" },
    { idea: "short" },
    { idea: "x".repeat(4001) },
    { workType: "unlisted" },
    { budget: "invalid" },
    { name: "Name\r\nBcc: other@example.com" },
    { size: "x".repeat(201) },
  ])("rejects invalid fields %o", (fields) =>
    expect(inquirySchema.safeParse({ ...good, ...fields }).success).toBe(false),
  );
});
describe("commission Worker", () => {
  it("sends one validated email only to the configured artist, with bounded attachments", async () => {
    const send = provider();
    const response = await handleCommission(request({}, [png()]), env(), send);
    expect(response.status).toBe(200);
    expect(send).toHaveBeenCalledTimes(2);
    const verify = JSON.parse(String(send.mock.calls[0][1]?.body));
    expect(verify.secret).toBe("test-secret");
    const payload = JSON.parse(String(send.mock.calls[1][1]?.body));
    expect(payload.to).toEqual(["owner@artist.example"]);
    expect(payload.reply_to).toBe("taylor@example.com");
    expect(payload.attachments[0].filename).toBe("inspiration-1.png");
    expect(payload.html).toBeUndefined();
  });
  it("preserves an idempotency key for explicit retries", async () => {
    const a = provider(),
      b = provider();
    await handleCommission(request(), env(), a);
    await handleCommission(request(), env(), b);
    expect(a.mock.calls[1][1]?.headers).toEqual(b.mock.calls[1][1]?.headers);
  });
  it("keeps preview and unconfigured forms disabled", async () => {
    const e = env();
    e.INQUIRIES_ENABLED = "false";
    const send = provider();
    expect((await handleCommission(request(), e, send)).status).toBe(503);
    expect(send).not.toHaveBeenCalled();
  });
  it("fails closed when secrets are missing", async () => {
    const e = env();
    delete e.RESEND_API_KEY;
    expect((await handleCommission(request(), e, provider())).status).toBe(503);
  });
  it("rejects foreign origins", async () => {
    const send = provider();
    expect(
      (
        await handleCommission(
          request({}, [], "https://foreign.example"),
          env(),
          send,
        )
      ).status,
    ).toBe(403);
    expect(send).not.toHaveBeenCalled();
  });
  it("rejects production credentials on a preview hostname", async () => {
    const original = request();
    const req = new Request(
      "https://preview.artist.example/api/commissions",
      original,
    );
    expect((await handleCommission(req, env(), provider())).status).toBe(403);
  });
  it("rejects missing Cloudflare client IP", async () => {
    const req = request();
    req.headers.delete("CF-Connecting-IP");
    expect((await handleCommission(req, env(), provider())).status).toBe(403);
  });
  it("accepts only POST", async () =>
    expect(
      (
        await handleCommission(
          new Request("https://artist.example/api/commissions"),
          env(),
          provider(),
        )
      ).status,
    ).toBe(405));
  it("rate limits before contacting external services", async () => {
    const e = env();
    e.INQUIRY_RATE_LIMITER.limit = vi
      .fn()
      .mockResolvedValue({ success: false });
    const send = provider();
    const result = await handleCommission(request(), e, send);
    expect(result.status).toBe(429);
    expect(result.headers.get("Retry-After")).toBe("60");
    expect(send).not.toHaveBeenCalled();
  });
  it("enforces the email rate limit", async () => {
    const e = env();
    e.EMAIL_RATE_LIMITER.limit = vi.fn().mockResolvedValue({ success: false });
    expect((await handleCommission(request(), e, provider())).status).toBe(429);
  });
  it("rejects honeypot submissions", async () =>
    expect(
      (await handleCommission(request({ website: "spam" }), env(), provider()))
        .status,
    ).toBe(400));
  it("rejects instant submissions", async () =>
    expect(
      (
        await handleCommission(
          request({ startedAt: String(Date.now()) }),
          env(),
          provider(),
        )
      ).status,
    ).toBe(400));
  it("returns accessible field errors", async () => {
    const response = await handleCommission(
      request({ email: "bad", idea: "short" }),
      env(),
      provider(),
    );
    expect(response.status).toBe(400);
    expect((await response.json()).errors).toHaveProperty("email");
  });
  it("rejects unsupported file types", async () => {
    const file = new File(["<svg/>"], "bad.svg", { type: "image/svg+xml" });
    expect(
      (await handleCommission(request({}, [file]), env(), provider())).status,
    ).toBe(400);
  });
  it("rejects a file masquerading as an image", async () => {
    const file = new File(["not an image at all"], "bad.png", {
      type: "image/png",
    });
    expect(
      (await handleCommission(request({}, [file]), env(), provider())).status,
    ).toBe(400);
  });
  it("rejects more than three uploads", async () =>
    expect(
      (
        await handleCommission(
          request({}, [png(), png(), png(), png()]),
          env(),
          provider(),
        )
      ).status,
    ).toBe(400));
  it("rejects an oversized individual upload", async () =>
    expect(
      (
        await handleCommission(
          request({}, [png(2 * 1024 * 1024 + 1)]),
          env(),
          provider(),
        )
      ).status,
    ).toBe(400));
  it("rejects combined uploads larger than 5 MB", async () =>
    expect(
      (
        await handleCommission(
          request({}, [png(1800000), png(1800000), png(1800000)]),
          env(),
          provider(),
        )
      ).status,
    ).toBe(400));
  it("enforces the actual body size even without Content-Length", async () => {
    const req = new Request("https://artist.example/api/commissions", {
      method: "POST",
      headers: {
        Origin: "https://artist.example",
        "CF-Connecting-IP": "192.0.2.1",
        "Content-Type": "multipart/form-data; boundary=test",
      },
      body: new Uint8Array(MAX_BODY_BYTES + 1),
    });
    expect((await handleCommission(req, env(), provider())).status).toBe(413);
  });
  it("rejects duplicate fields", async () => {
    const form = await request().formData();
    form.append("email", "another@example.com");
    const req = new Request("https://artist.example/api/commissions", {
      method: "POST",
      headers: {
        Origin: "https://artist.example",
        "CF-Connecting-IP": "192.0.2.1",
      },
      body: form,
    });
    expect((await handleCommission(req, env(), provider())).status).toBe(400);
  });
  it.each([
    { success: false, hostname: "artist.example", action: "commission" },
    { success: true, hostname: "foreign.example", action: "commission" },
    { success: true, hostname: "artist.example", action: "other" },
  ])(
    "does not email after invalid Turnstile verification %o",
    async (result) => {
      const send = vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json(result));
      expect((await handleCommission(request(), env(), send)).status).toBe(400);
      expect(send).toHaveBeenCalledTimes(1);
    },
  );
  it("does not report success when the email provider fails", async () => {
    const send = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json({
          success: true,
          hostname: "artist.example",
          action: "commission",
        }),
      )
      .mockResolvedValueOnce(
        Response.json({ error: "unavailable" }, { status: 503 }),
      );
    const response = await handleCommission(request(), env(), send);
    expect(response.status).toBe(502);
    expect(send).toHaveBeenCalledTimes(2);
  });
  it("does not retry a timed-out provider request", async () => {
    const send = vi.fn<typeof fetch>().mockRejectedValue(new Error("timeout"));
    expect((await handleCommission(request(), env(), send)).status).toBe(503);
    expect(send).toHaveBeenCalledTimes(1);
  });
});
