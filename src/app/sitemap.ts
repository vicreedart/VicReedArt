import type { MetadataRoute } from "next";
import { artworks, absoluteUrl, content } from "@/content/site";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return content.production
    ? [
        "/",
        "/work/",
        "/about/",
        "/commissions/",
        "/privacy/",
        ...artworks.map((a) => `/work/${a.slug}/`),
      ].map((path) => ({ url: absoluteUrl(path) }))
    : [];
}
