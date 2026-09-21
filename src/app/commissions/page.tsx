import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";
import { ArtImage } from "@/components/art-image";
import { WaveMark } from "@/components/wave";
import { CommissionForm } from "@/components/commission-form";
import { settings, content } from "@/content/site";
export const metadata: Metadata = {
  title: "Commissions",
  description:
    "Share your idea for a custom mosaic surfboard or coastal artwork.",
  alternates: { canonical: "/commissions/" },
  openGraph: { url: "/commissions/" },
};
export default function CommissionsPage() {
  const page = settings.commissions;
  const enabled =
    content.production &&
    page.isOpen &&
    process.env.NEXT_PUBLIC_INQUIRIES_ENABLED === "true";
  return (
    <main id="main-content" className="commissions-page content-width">
      <SectionHeading title={page.title} subtitle={page.subtitle} />
      <p className="commission-intro">{page.introduction}</p>
      <div className="commission-layout">
        {page.isOpen ? (
          <CommissionForm
            enabled={enabled}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
            privacyNote={page.privacyNote}
            successMessage={page.successMessage}
          />
        ) : (
          <div className="commissions-closed">
            <WaveMark />
            <h2>A little pause in the studio</h2>
            <p>{page.closedMessage}</p>
          </div>
        )}
        <aside className="commission-aside">
          <ArtImage
            image={page.image}
            priority
            sizes="(max-width: 760px) 80vw, 25vw"
          />
          <p className="script">{page.note}</p>
          <WaveMark />
        </aside>
      </div>
    </main>
  );
}
