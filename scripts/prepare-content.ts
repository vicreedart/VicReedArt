import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createClient } from "@sanity/client";
import { contentSchema } from "../src/content/model.ts";
import { demoContent } from "../src/content/demo.ts";

for (const file of [".env.local", ".env"])
  if (existsSync(file)) process.loadEnvFile(file);
const production = process.env.DEPLOYMENT_ENV === "production";
const mode = process.env.CONTENT_MODE || "demo";
if (!["demo", "sanity"].includes(mode))
  throw new Error("CONTENT_MODE must be demo or sanity.");
if (production && mode !== "sanity")
  throw new Error(
    "Production requires real Sanity content. Demo mode is preview only.",
  );
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const url = new URL(siteUrl);
if (
  production &&
  (url.protocol !== "https:" || /localhost|example\./.test(url.hostname))
)
  throw new Error("Production requires the final HTTPS NEXT_PUBLIC_SITE_URL.");
const imageProjection =
  '{"src":asset->url,alt,"width":asset->metadata.dimensions.width,"height":asset->metadata.dimensions.height,"position":coalesce(position,"50% 50%")}';
let data: unknown = demoContent;
if (mode === "sanity") {
  const projectId = process.env.SANITY_PROJECT_ID,
    dataset = process.env.SANITY_DATASET;
  if (!projectId || !dataset)
    throw new Error(
      "Set the artist-owned SANITY_PROJECT_ID and SANITY_DATASET.",
    );
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2026-09-01",
    useCdn: false,
    perspective: "published",
    token: process.env.SANITY_READ_TOKEN,
    maxRetries: 0,
    timeout: 15000,
  });
  data = await client.fetch(`{
    "settings": *[_type == "siteSettings" && _id == "siteSettings"][0]{
      ..., "contactEmail":coalesce(contactEmail,""), "socialLinks":coalesce(socialLinks,[]), home{...,hero${imageProjection}}, about{...,"location":coalesce(location,""),"portraitCaption":coalesce(portraitCaption,""),portrait${imageProjection}}, commissions{...,image${imageProjection}}
    },
    "artworks": *[_type == "artwork" && archived != true] | order(displayOrder asc, title asc) [0...501]{
      "id":_id,title,"slug":slug.current,images[]${imageProjection},price,currency,status,category,"dimensions":coalesce(dimensions,""),"materials":coalesce(materials,""),year,description,"featured":coalesce(featured,false),"displayOrder":coalesce(displayOrder,0),"commissionCta":coalesce(commissionCta,""),"isDemo":coalesce(isDemo,false)
    }
  }`);
}
const parsed = contentSchema.parse(data);
const slugs = parsed.artworks.map((a) => a.slug);
if (new Set(slugs).size !== slugs.length)
  throw new Error("Artwork slugs must be unique.");
if (!parsed.artworks.length)
  throw new Error(
    "Publish at least one artwork in Sanity before building the portfolio.",
  );
if (!parsed.artworks.some((a) => a.featured))
  throw new Error("Choose at least one Featured artwork in Sanity.");
if (production) {
  if (!parsed.settings.readyToPublish || parsed.artworks.some((a) => a.isDemo))
    throw new Error(
      "Approve content for launch and replace all sample artwork.",
    );
  const images = [
    parsed.settings.home.hero,
    parsed.settings.about.portrait,
    parsed.settings.commissions.image,
    ...parsed.artworks.flatMap((a) => a.images),
  ];
  if (
    images.some(
      (i) =>
        !i.src.startsWith(
          `https://cdn.sanity.io/images/${process.env.SANITY_PROJECT_ID}/`,
        ),
    )
  )
    throw new Error(
      "Production photographs must be uploaded to the artist’s Sanity project.",
    );
  if (
    parsed.settings.commissions.isOpen &&
    (process.env.NEXT_PUBLIC_INQUIRIES_ENABLED !== "true" ||
      !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
  )
    throw new Error(
      "Open commissions require a configured Turnstile site key and enabled inquiry form.",
    );
}
await mkdir("src/content", { recursive: true });
await writeFile(
  "src/content/generated.json",
  JSON.stringify({ ...parsed, mode, production, siteUrl }, null, 2) + "\n",
);
console.log(
  `Prepared ${parsed.artworks.length} ${mode} artwork entries for ${production ? "production" : "preview"}.`,
);
