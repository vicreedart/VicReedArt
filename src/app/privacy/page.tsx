import type { Metadata } from "next";
import { settings } from "@/content/site";
export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy/" },
};
export default function PrivacyPage() {
  return (
    <main id="main-content" className="privacy-page content-width">
      <h1>Privacy</h1>
      <p>
        The commission form collects the details you provide so the artist can
        respond to your inquiry. Your name, email, message, and optional
        reference images are sent to the artist through Resend and kept in the
        artist’s email account. This website does not create a separate inquiry
        database or store your uploaded files.
      </p>
      <p>
        Cloudflare hosts the website and provides Turnstile to help prevent
        spam. When you submit an inquiry, your IP address is used to verify the
        request and enforce a short rate limit. The application does not log
        inquiry contents or use advertising analytics.
      </p>
      <p>
        Please do not send sensitive personal information. Upload only images
        you have permission to share. Email delivery and retention are subject
        to the artist’s email service and Resend’s policies.
      </p>
      <p>
        To ask about an inquiry you have sent or request its deletion,{" "}
        {settings.contactEmail ? (
          <a href={`mailto:${settings.contactEmail}`}>
            contact the artist by email
          </a>
        ) : (
          <>
            contact the artist through the contact details provided with your
            commission correspondence
          </>
        )}
        .
      </p>
    </main>
  );
}
