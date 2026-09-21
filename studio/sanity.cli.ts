import { defineCliConfig } from "sanity/cli";
import { assertSanityTarget } from "./sanity-target";
assertSanityTarget(
  process.env.SANITY_STUDIO_PROJECT_ID,
  process.env.SANITY_STUDIO_DATASET,
);
export default defineCliConfig({
  deployment: { appId: "s8q8gzyrfhwpceymvn2ks7r8" },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },
  studioHost: process.env.SANITY_STUDIO_HOSTNAME,
});
