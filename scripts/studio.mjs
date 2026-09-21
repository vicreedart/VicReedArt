import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

for (const file of [".env.local", ".env"])
  if (existsSync(file)) process.loadEnvFile(file);
const command = process.argv[2];
if (!["dev", "build", "deploy"].includes(command))
  throw new Error("Unknown Studio command.");
const result = spawnSync(
  process.execPath,
  [resolve("node_modules/sanity/bin/sanity"), command],
  {
    cwd: resolve("studio"),
    stdio: "inherit",
    env: process.env,
  },
);
process.exit(result.status ?? 1);
