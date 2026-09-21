import { spawnSync } from "node:child_process";
const result = spawnSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["run", "build"],
  {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      CONTENT_MODE: "sanity",
      DEPLOYMENT_ENV: "production",
    },
  },
);
process.exit(result.status ?? 1);
