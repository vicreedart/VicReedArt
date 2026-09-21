import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const content = JSON.parse(
  await readFile("src/content/generated.json", "utf8"),
);
const hashes = new Set();
async function collect(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = `${folder}/${entry.name}`;
    if (entry.isDirectory()) await collect(path);
    else if (path.endsWith(".html")) {
      const html = await readFile(path, "utf8");
      for (const match of html.matchAll(
        /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
      ))
        if (!/\bsrc\s*=/.test(match[1]))
          hashes.add(
            `'sha256-${createHash("sha256").update(match[2]).digest("base64")}'`,
          );
    }
  }
}
await collect("out");
const csp = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].join(" ")} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://cdn.sanity.io",
  "font-src 'self'",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");
// Cloudflare _headers has a 2,000-character line limit; use separate per-page rules if needed.
if (csp.length > 1900) {
  const entries = [];
  async function perPage(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const path = `${folder}/${entry.name}`;
      if (entry.isDirectory()) await perPage(path);
      else if (path.endsWith(".html")) {
        const html = await readFile(path, "utf8"),
          local = new Set();
        for (const match of html.matchAll(
          /<script\b([^>]*)>([\s\S]*?)<\/script>/gi,
        ))
          if (!/\bsrc\s*=/.test(match[1]))
            local.add(
              `'sha256-${createHash("sha256").update(match[2]).digest("base64")}'`,
            );
        const policy = csp.replace([...hashes].join(" "), [...local].join(" "));
        if (policy.length > 1900)
          throw new Error("Page CSP exceeds the Cloudflare header limit.");
        const route = path.replace(/^out/, "").replace(/index\.html$/, "");
        entries.push(`${route}\n  Content-Security-Policy: ${policy}`);
      }
    }
  }
  await perPage("out");
  await writeFile(
    "out/_headers",
    `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n${content.production ? "" : "  X-Robots-Tag: noindex, nofollow\n"}\n/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable\n\n${entries.join("\n\n")}\n`,
  );
} else
  await writeFile(
    "out/_headers",
    `/*\n  Content-Security-Policy: ${csp}\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n${content.production ? "" : "  X-Robots-Tag: noindex, nofollow\n"}\n/_next/static/*\n  Cache-Control: public, max-age=31536000, immutable\n`,
  );
await writeFile(
  "out/build-info.json",
  JSON.stringify({
    mode: content.mode,
    production: content.production,
    artworkCount: content.artworks.length,
    contentHash: createHash("sha256")
      .update(JSON.stringify(content))
      .digest("hex"),
  }) + "\n",
);
console.log(
  "Static export prepared with security headers and preview indexing safeguards.",
);
