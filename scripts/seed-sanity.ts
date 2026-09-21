import { createClient } from "@sanity/client";
import { createReadStream, existsSync } from "node:fs";
import { demoContent } from "../src/content/demo.ts";
for (const file of [".env.local", ".env"])
  if (existsSync(file)) process.loadEnvFile(file);
const projectId = process.env.SANITY_PROJECT_ID,
  dataset = process.env.SANITY_DATASET,
  token = process.env.SANITY_WRITE_TOKEN;
if (!projectId || !dataset || !token)
  throw new Error(
    "Set artist-owned SANITY_PROJECT_ID, SANITY_DATASET, and a temporary SANITY_WRITE_TOKEN.",
  );
if (process.argv[2] !== `--project=${projectId}`)
  throw new Error(
    "Pass --project=THE_ARTIST_PROJECT_ID to confirm the intended seed destination.",
  );
const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2026-09-01",
  useCdn: false,
  maxRetries: 0,
});
if ((await client.fetch('count(*[_type in ["siteSettings","artwork"]])')) !== 0)
  throw new Error(
    "Seed refused: project already contains artwork or settings. This script never replaces existing content.",
  );
const assets = new Map<string, string>();
const photos = [
  demoContent.settings.home.hero,
  demoContent.settings.about.portrait,
  demoContent.settings.commissions.image,
  ...demoContent.artworks.flatMap((a) => a.images),
];
for (const photo of photos) {
  if (assets.has(photo.src)) continue;
  const asset = await client.assets.upload(
    "image",
    createReadStream(`public${photo.src}`),
    { filename: photo.src.split("/").pop() },
  );
  assets.set(photo.src, asset._id);
}
const image = (photo: (typeof photos)[number]) => ({
  _type: "artPhoto",
  asset: { _type: "reference", _ref: assets.get(photo.src) },
  alt: photo.alt,
  position: photo.position,
});
const s = demoContent.settings;
let transaction = client
  .transaction()
  .create({
    _id: "siteSettings",
    _type: "siteSettings",
    ...s,
    readyToPublish: false,
    home: { ...s.home, hero: image(s.home.hero) },
    about: { ...s.about, portrait: image(s.about.portrait) },
    commissions: {
      ...s.commissions,
      isOpen: false,
      image: image(s.commissions.image),
    },
  });
for (const art of demoContent.artworks) {
  const { id, slug, images, ...fields } = art;
  transaction = transaction.create({
    _id: id,
    _type: "artwork",
    ...fields,
    isDemo: true,
    archived: false,
    slug: { _type: "slug", current: slug },
    images: images.map((p, i) => ({ ...image(p), _key: `photo-${i}` })),
  });
}
await transaction.commit();
console.log(
  "Created labeled sample artwork and draft launch settings. Replace all sample content before approving launch. Revoke the temporary write token when finished.",
);
