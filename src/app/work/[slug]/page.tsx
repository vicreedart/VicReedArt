import type { Metadata } from "next";
import { SiteLink as Link } from "@/components/site-link";
import { notFound } from "next/navigation";
import { ArtImage, imageUrl } from "@/components/art-image";
import { ArtworkCard } from "@/components/artwork-card";
import {
  artworks,
  artworkPrice,
  absoluteUrl,
  content,
  settings,
} from "@/content/site";
export const dynamicParams = false;
export function generateStaticParams() {
  return artworks.map((a) => ({ slug: a.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artwork = artworks.find((a) => a.slug === slug);
  if (!artwork) return {};
  const description = artwork.description.join(" ").slice(0, 190);
  return {
    title: artwork.title,
    description,
    alternates: { canonical: `/work/${slug}/` },
    openGraph: {
      title: `${artwork.title} | ${settings.brand}`,
      description,
      url: `/work/${slug}/`,
      images: [
        {
          url: absoluteUrl(imageUrl(artwork.images[0].src, 1440)),
          alt: artwork.images[0].alt,
        },
      ],
    },
  };
}
export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = artworks.find((a) => a.slug === slug);
  if (!artwork) notFound();
  const price = artworkPrice(artwork.price, artwork.currency);
  const other = artworks.filter((a) => a.slug !== slug).slice(0, 3);
  const schema = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    url: absoluteUrl(`/work/${slug}/`),
    image: artwork.images.map((i) => absoluteUrl(i.src)),
    description: artwork.description.join(" "),
    creator: { "@type": "Person", name: settings.artistName },
    ...(artwork.materials ? { artMedium: artwork.materials } : {}),
    ...(artwork.year ? { dateCreated: String(artwork.year) } : {}),
  };
  return (
    <main id="main-content" className="artwork-page content-width">
      {content.production ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
      ) : null}
      <Link className="back-link" href="/work/">
        ← Back to all work
      </Link>
      <div className="artwork-detail">
        <div className="detail-images">
          {artwork.images.map((img, i) => (
            <figure key={img.src}>
              <ArtImage
                image={img}
                priority={i === 0}
                sizes="(max-width: 760px) 100vw, 55vw"
              />
            </figure>
          ))}
        </div>
        <div className="detail-copy">
          <p className="eyebrow">
            {artwork.isDemo
              ? "Sample artwork"
              : artwork.category.replace("-", " ")}
          </p>
          <h1>{artwork.title}</h1>
          <p className="detail-availability">
            {price ? <span>{price}</span> : null}
            <span className={artwork.status === "available" ? "available" : ""}>
              {artwork.status === "sold"
                ? "Sold"
                : artwork.status === "available"
                  ? "Available"
                  : "Not for sale"}
            </span>
          </p>
          {artwork.description.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <dl>
            {artwork.dimensions ? (
              <>
                <dt>Dimensions</dt>
                <dd>{artwork.dimensions}</dd>
              </>
            ) : null}
            {artwork.materials ? (
              <>
                <dt>Materials</dt>
                <dd>{artwork.materials}</dd>
              </>
            ) : null}
            {artwork.year ? (
              <>
                <dt>Year</dt>
                <dd>{artwork.year}</dd>
              </>
            ) : null}
          </dl>
          {settings.commissions.isOpen && artwork.commissionCta ? (
            <Link
              href={`/commissions/?artwork=${encodeURIComponent(artwork.title)}`}
              className="button button-solid"
            >
              {artwork.commissionCta}
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
      {other.length ? (
        <section className="related-work">
          <h2 className="section-title">More from the studio</h2>
          <div className="artwork-grid related-grid">
            {other.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
