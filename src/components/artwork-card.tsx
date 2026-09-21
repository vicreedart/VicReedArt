import { SiteLink as Link } from "@/components/site-link";
import type { Artwork } from "@/content/model";
import { artworkPrice } from "@/content/site";
import { ArtImage } from "./art-image";
export function ArtworkCard({
  artwork,
  priority = false,
}: {
  artwork: Artwork;
  priority?: boolean;
}) {
  const price = artworkPrice(artwork.price, artwork.currency);
  return (
    <article className="artwork-card">
      <Link
        className="artwork-image-link"
        href={`/work/${artwork.slug}/`}
        aria-label={`View ${artwork.title}`}
      >
        <div className="artwork-image">
          <ArtImage image={artwork.images[0]} priority={priority} />
          <span className="image-arrow" aria-hidden="true">
            ↗
          </span>
        </div>
      </Link>
      <div className="artwork-caption">
        <h2>
          <Link href={`/work/${artwork.slug}/`}>{artwork.title}</Link>
        </h2>
        {price ? <p className="artwork-price">{price}</p> : null}
        <p
          className={`artwork-status ${artwork.status === "available" ? "available" : ""}`}
        >
          {artwork.isDemo ? "Sample · " : ""}
          {artwork.status === "sold"
            ? "Sold"
            : artwork.status === "available"
              ? "Available"
              : "Not for sale"}
        </p>
      </div>
    </article>
  );
}
