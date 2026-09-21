import type { Metadata } from "next";
import { ArtworkCard } from "@/components/artwork-card";
import { SectionHeading } from "@/components/section-heading";
import { settings, artworks } from "@/content/site";
export const metadata: Metadata = {
  title: "My Work",
  description:
    "Explore mosaic surfboards, mosaics, and coastal artwork by VicReedArt.",
  alternates: { canonical: "/work/" },
  openGraph: { url: "/work/" },
};
export default function WorkPage() {
  return (
    <main id="main-content" className="gallery-page content-width">
      <SectionHeading
        title={settings.work.title}
        subtitle={settings.work.subtitle}
      />
      <div className="artwork-grid">
        {artworks.map((a, i) => (
          <ArtworkCard key={a.id} artwork={a} priority={i < 4} />
        ))}
      </div>
      <p className="gallery-end">
        {artworks.length} pieces, each with a story of its own.
      </p>
    </main>
  );
}
