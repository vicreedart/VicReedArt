import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
const names = ["hero", "wave", "tide", "island", "studio", "shore"];
const widths = [320, 480, 720, 960, 1440, 1920];
await mkdir("public/images/demo", { recursive: true });
for (const name of names) {
  const source = `output/imagegen/${name}.png`;
  const meta = await sharp(source).metadata();
  await sharp(source)
    .webp({ quality: 83, effort: 5 })
    .toFile(`public/images/demo/${name}.webp`);
  for (const width of widths.filter((w) => w <= meta.width))
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(`public/images/demo/${name}-${width}.webp`);
}
await writeFile(
  "public/images/demo/NOTICE.txt",
  "AI-generated temporary website preview imagery. Not photographs of VicReedArt artwork or of the artist. Replace with original approved images in Sanity before launch.\n",
);
console.log("Prepared responsive WebP preview assets.");
