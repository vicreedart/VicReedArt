"use client";
import { useEffect, useRef, useState } from "react";
import {
  BUDGETS,
  WORK_TYPES,
  inquirySchema,
  fieldErrors,
  validateFiles,
  type InquiryErrors,
} from "@/lib/inquiry";
import { Turnstile } from "./turnstile";
export function CommissionForm({
  enabled,
  siteKey,
  privacyNote,
  successMessage,
}: {
  enabled: boolean;
  siteKey: string;
  privacyNote: string;
  successMessage: string;
}) {
  const formRef = useRef<HTMLFormElement>(null),
    busy = useRef(false),
    started = useRef(0),
    submission = useRef<string | null>(null),
    noticeRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<InquiryErrors>({}),
    [message, setMessage] = useState(""),
    [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
      "idle",
    ),
    [token, setToken] = useState(""),
    [resetKey, setResetKey] = useState(0),
    [fileNames, setFileNames] = useState<string[]>([]);
  useEffect(() => {
    started.current = Date.now();
    const artwork = new URLSearchParams(window.location.search).get("artwork");
    if (artwork && formRef.current) {
      const idea = formRef.current.elements.namedItem(
        "idea",
      ) as HTMLTextAreaElement;
      idea.value = `I’m interested in a piece similar to ${artwork.slice(0, 150)}. `;
    }
  }, []);
  function report(text: string, fields: InquiryErrors = {}) {
    setMessage(text);
    setErrors(fields);
    setStatus("error");
    requestAnimationFrame(() => {
      const first = Object.keys(fields)[0];
      if (first) document.getElementById(first)?.focus();
      else noticeRef.current?.focus();
    });
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const data = new FormData(event.currentTarget);
    const parsed = inquirySchema.safeParse(Object.fromEntries(data));
    const files = data
      .getAll("images")
      .filter((v): v is File => v instanceof File && Boolean(v.name));
    const fileError = validateFiles(files);
    if (!parsed.success || fileError) {
      report("Please check the highlighted fields.", {
        ...(!parsed.success ? fieldErrors(parsed.error) : {}),
        ...(fileError ? { images: fileError } : {}),
      });
      return;
    }
    if (!enabled) {
      report("This is a design preview. Your inquiry has not been sent.");
      return;
    }
    if (!token) {
      report("Please complete the verification before sending.", {
        verification: "Please complete the verification.",
      });
      return;
    }
    busy.current = true;
    setStatus("sending");
    setErrors({});
    setMessage("Sending your inquiry…");
    submission.current ??= crypto.randomUUID();
    data.set("submissionId", submission.current);
    data.set("startedAt", String(started.current));
    data.set("cf-turnstile-response", token);
    try {
      const response = await fetch("/api/commissions", {
        method: "POST",
        body: data,
        signal: AbortSignal.timeout(30000),
      });
      const result = (await response.json()) as {
        message?: string;
        errors?: InquiryErrors;
      };
      if (!response.ok) {
        report(
          result.message || "Something went wrong. Please try again.",
          result.errors,
        );
        return;
      }
      setStatus("success");
      setMessage(successMessage);
      formRef.current?.reset();
      setFileNames([]);
      requestAnimationFrame(() => noticeRef.current?.focus());
    } catch {
      report(
        "We could not confirm delivery. Your form is still here. Please check your connection and try again.",
      );
    } finally {
      busy.current = false;
      setToken("");
      setResetKey((k) => k + 1);
    }
  }
  const invalid = (key: keyof InquiryErrors) => ({
    "aria-invalid": Boolean(errors[key]),
    "aria-describedby": errors[key] ? `${key}-error` : undefined,
  });
  const error = (key: keyof InquiryErrors) =>
    errors[key] ? (
      <span id={`${key}-error`} className="field-error">
        {errors[key]}
      </span>
    ) : null;
  if (status === "success")
    return (
      <div className="form-success" ref={noticeRef} tabIndex={-1} role="status">
        <span className="success-mark" aria-hidden="true">
          ✓
        </span>
        <h2>Your idea is on its way.</h2>
        <p>{message}</p>
        <p>You can close this page. There’s no need to submit again.</p>
      </div>
    );
  return (
    <form
      ref={formRef}
      className="commission-form"
      onSubmit={submit}
      noValidate
      aria-busy={status === "sending"}
    >
      <h2 className="form-title">Commission inquiry</h2>
      {!enabled ? (
        <p className="form-preview-note">
          Preview form · Submissions are not sent.
        </p>
      ) : null}
      <div className="form-grid">
        <label htmlFor="name">
          Name <span aria-hidden="true">*</span>
          <input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            required
            minLength={2}
            maxLength={100}
            {...invalid("name")}
          />
          {error("name")}
        </label>
        <label htmlFor="email">
          Email <span aria-hidden="true">*</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Your email"
            required
            maxLength={254}
            {...invalid("email")}
          />
          {error("email")}
        </label>
      </div>
      <label htmlFor="workType">
        What are you interested in? <span aria-hidden="true">*</span>
        <select
          id="workType"
          name="workType"
          required
          defaultValue=""
          {...invalid("workType")}
        >
          <option value="" disabled>
            Select an option
          </option>
          {WORK_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        {error("workType")}
      </label>
      <label htmlFor="idea">
        Do you have a specific subject or theme in mind?{" "}
        <span aria-hidden="true">*</span>
        <textarea
          id="idea"
          name="idea"
          rows={5}
          placeholder="Tell me about your idea…"
          required
          minLength={20}
          maxLength={4000}
          {...invalid("idea")}
        />
        {error("idea")}
      </label>
      <div className="form-grid">
        <label htmlFor="colors">
          Preferred colors <span>(optional)</span>
          <input
            id="colors"
            name="colors"
            placeholder="e.g. blues, greens, neutrals…"
            maxLength={200}
            {...invalid("colors")}
          />
          {error("colors")}
        </label>
        <label htmlFor="size">
          Approximate size <span>(optional)</span>
          <input
            id="size"
            name="size"
            placeholder={"e.g. 12″ × 36″"}
            maxLength={200}
            {...invalid("size")}
          />
          {error("size")}
        </label>
      </div>
      <label htmlFor="budget" className="budget-field">
        Budget range <span>(optional)</span>
        <select
          id="budget"
          name="budget"
          defaultValue=""
          {...invalid("budget")}
        >
          <option value="">Select a range</option>
          {BUDGETS.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        {error("budget")}
      </label>
      <label htmlFor="images" className="upload-field">
        Inspiration photos <span>(optional)</span>
        <input
          id="images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          aria-describedby={
            errors.images ? "images-help images-error" : "images-help"
          }
          aria-invalid={Boolean(errors.images)}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setFileNames(files.map((f) => f.name));
            setErrors((prev) => ({ ...prev, images: validateFiles(files) }));
          }}
        />
        <span id="images-help" className="field-help">
          Up to 3 images · JPEG, PNG, WebP · 2 MB each, 5 MB total
        </span>
        {error("images")}
        {fileNames.length ? (
          <span className="selected-files">{fileNames.join(" · ")}</span>
        ) : null}
      </label>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">
          Leave this field empty
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {enabled && siteKey ? (
        <div id="verification" tabIndex={-1}>
          <Turnstile
            siteKey={siteKey}
            onToken={setToken}
            onError={() =>
              setErrors((prev) => ({
                ...prev,
                verification:
                  "Verification could not load. Please refresh the page.",
              }))
            }
            resetKey={resetKey}
          />
          {error("verification")}
        </div>
      ) : null}
      <p className="form-privacy">{privacyNote}</p>
      <div
        ref={noticeRef}
        tabIndex={-1}
        role={status === "error" ? "alert" : "status"}
        className={message ? `form-message ${status}` : "form-message-empty"}
      >
        {message}
      </div>
      <button
        className="button button-solid submit-button"
        type="submit"
        disabled={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Submit inquiry"}
        <span aria-hidden="true">→</span>
      </button>
      <p className="required-note">* Required fields</p>
    </form>
  );
}
