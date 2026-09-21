import type { Metadata } from "next";
import { SiteLink as Link } from "@/components/site-link";
import { ArtImage } from "@/components/art-image";
import { WaveMark } from "@/components/wave";
import { settings } from "@/content/site";
export const metadata: Metadata = {
  title: "About the Artist",
  description:
    "Meet the artist behind VicReedArt’s coastal mosaics and surfboards.",
  alternates: { canonical: "/about/" },
  openGraph: { url: "/about/" },
};
export default function AboutPage() {
  const about = settings.about;
  return (
    <main id="main-content" className="about-page content-width">
      <div className="about-layout">
        <figure className="artist-portrait">
          <ArtImage
            image={about.portrait}
            priority
            sizes="(max-width: 760px) 100vw, 50vw"
          />
          {about.portraitCaption ? (
            <figcaption>{about.portraitCaption}</figcaption>
          ) : null}
        </figure>
        <div className="about-copy">
          <p className="eyebrow">The artist behind the pieces</p>
          <h1>{about.title}</h1>
          {about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <WaveMark />
          <div className="studio-details">
            {about.location ? <p>{about.location}</p> : null}
            <p>
              {settings.commissions.isOpen
                ? "Available for commissions"
                : "Commissions currently closed"}
            </p>
          </div>
          <Link href="/commissions/" className="text-link">
            Let’s create something <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className="artist-statement">
        <svg viewBox="0 0 360 110" fill="none" aria-hidden="true">
          <path
            d="M0 90C95 98 180 18 255 20c27 0 45 16 57 30-55-25-72 5-55 29 11 15 45 18 91 19"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <p className="script">{about.statement}</p>
        <span />
      </div>
    </main>
  );
}
