import { handleCommission } from "./inquiry";
export interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}
export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  INQUIRY_RATE_LIMITER: RateLimit;
  EMAIL_RATE_LIMITER: RateLimit;
  SITE_URL?: string;
  INQUIRIES_ENABLED?: string;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  INQUIRY_FROM_EMAIL?: string;
  INQUIRY_TO_EMAIL?: string;
}
const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/api/commissions" || path === "/api/commissions/")
      return handleCommission(request, env);
    if (path.startsWith("/api/"))
      return new Response("Not found", { status: 404 });
    return env.ASSETS.fetch(request);
  },
};
export default worker;
