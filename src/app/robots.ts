import type { MetadataRoute } from "next";
import { content, absoluteUrl } from "@/content/site";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return content.production
    ? {
        rules: { userAgent: "*", allow: "/", disallow: "/api/" },
        sitemap: absoluteUrl("/sitemap.xml"),
      }
    : { rules: { userAgent: "*", disallow: "/" } };
}
