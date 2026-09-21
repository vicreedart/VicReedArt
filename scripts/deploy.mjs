import { readFileSync } from "node:fs";
import { spawnSync, execFileSync } from "node:child_process";
import { assertTargets } from "./targets.mjs";
import { createHash } from "node:crypto";
const mode = process.argv[2];
if (!["production", "preview"].includes(mode))
  throw new Error("Choose production or preview.");
const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
const remote = execFileSync("git", ["remote", "get-url", "--push", "origin"], {
  encoding: "utf8",
}).trim();
assertTargets(remote, config.account_id, process.env.CLOUDFLARE_ACCOUNT_ID);
const content = JSON.parse(readFileSync("src/content/generated.json", "utf8"));
const built = JSON.parse(readFileSync("out/build-info.json", "utf8"));
if (
  built.contentHash !==
  createHash("sha256").update(JSON.stringify(content)).digest("hex")
)
  throw new Error(
    "Content has changed since the last successful build. Build again before deploying.",
  );
if (
  mode === "production" &&
  (!content.production ||
    content.mode !== "sanity" ||
    !content.settings.readyToPublish)
)
  throw new Error(
    "Run a successful production build with approved Sanity content before deploying production.",
  );
if (mode === "preview" && content.production)
  throw new Error(
    "Build a preview first; production output is not allowed on the preview Worker.",
  );
if (
  mode === "production" &&
  config.vars.SITE_URL !== new URL(content.siteUrl).origin
)
  throw new Error(
    "Production SITE_URL in wrangler.jsonc must match the built website origin.",
  );
if (
  mode === "production" &&
  content.settings.commissions.isOpen &&
  config.vars.INQUIRIES_ENABLED !== "true"
)
  throw new Error(
    "Enable the configured production inquiry endpoint before opening commissions.",
  );
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const args =
  mode === "preview"
    ? ["exec", "wrangler", "--", "deploy", "--env", "preview"]
    : ["exec", "wrangler", "--", "deploy"];
const result = spawnSync(npm, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: config.account_id },
});
process.exit(result.status ?? 1);
