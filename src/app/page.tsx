import type { Metadata } from "next";
import { SiteLink as Link } from "@/components/site-link";
import { ArtImage } from "@/components/art-image";
import { ArtworkCard } from "@/components/artwork-card";
import { WaveDivider, WaveMark } from "@/components/wave";
import { settings, artworks, content, absoluteUrl } from "@/content/site";
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};
export default function HomePage() {
  const featured = artworks.filter((a) => a.featured).slice(0, 4);
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.artistName,
    url: absoluteUrl("/about/"),
    jobTitle: "Mosaic artist",
    sameAs: settings.socialLinks.map((l) => l.url),
  };
  return (
    <main id="main-content">
      {content.production ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(person).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <section className="hero" aria-label="Coastal mosaic artwork">
        <ArtImage
          image={settings.home.hero}
          priority
          className="hero-image"
          sizes="100vw"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <h1>{settings.home.title}</h1>
          <p className="script hero-subtitle">{settings.home.subtitle}</p>
          <p className="eyebrow hero-categories">{settings.home.categories}</p>
          <Link href="/work/" className="button button-glass">
            Explore my work <span aria-hidden="true">→</span>
          </Link>
        </div>
        <WaveDivider />
      </section>
      <section
        className="featured-section content-width"
        aria-labelledby="featured-heading"
      >
        <h2 id="featured-heading" className="section-title">
          {settings.home.featuredHeading}
        </h2>
        <div className="artwork-grid">
          {featured.map((a) => (
            <ArtworkCard key={a.id} artwork={a} />
          ))}
        </div>
        <div className="center-action">
          <Link href="/work/" className="button">
            View all work <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <section className="home-intro content-width">
        <WaveMark />
        <p className="eyebrow">{settings.home.introEyebrow}</p>
        <h2>{settings.home.introTitle}</h2>
        <p>{settings.home.introText}</p>
        <Link href="/about/" className="text-link">
          Meet the artist <span aria-hidden="true">→</span>
        </Link>
      </section>
    </main>
  );
}
