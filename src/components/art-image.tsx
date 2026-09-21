import type { ArtworkImage } from "@/content/model";
const widths = [320, 480, 720, 960, 1440, 1920];
export function imageUrl(src: string, width: number) {
  if (!src.startsWith("https://cdn.sanity.io/images/")) return src;
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");
  url.searchParams.set("q", "82");
  return url.toString();
}
export function ArtImage({
  image,
  priority = false,
  sizes = "(max-width: 600px) 50vw, (max-width: 900px) 50vw, 25vw",
  className = "",
}: {
  image: ArtworkImage;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const sanity = image.src.startsWith("https://cdn.sanity.io/images/");
  const demo =
    image.src.startsWith("/images/demo/") && image.src.endsWith(".webp");
  const srcSet = sanity
    ? widths.map((w) => `${imageUrl(image.src, w)} ${w}w`).join(", ")
    : demo
      ? [
          ...widths
            .filter((w) => w <= image.width)
            .map((w) => `${image.src.replace(".webp", `-${w}.webp`)} ${w}w`),
          `${image.src} ${image.width}w`,
        ].join(", ")
      : undefined;
  return (
    <img
      className={className}
      src={imageUrl(image.src, priority ? 1920 : 960)}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={image.alt}
      style={{ objectPosition: image.position }}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
