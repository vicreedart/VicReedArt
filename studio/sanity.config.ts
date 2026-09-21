import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schema";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;
if (!projectId || !dataset)
  throw new Error(
    "Set SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET for the artist’s Sanity project.",
  );
export default defineConfig({
  name: "vicreedart",
  title: "VicReedArt · Studio",
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Your website")
          .items([
            S.listItem()
              .title("Artwork")
              .child(
                S.documentTypeList("artwork")
                  .title("Your artwork")
                  .defaultOrdering([
                    { field: "displayOrder", direction: "asc" },
                  ]),
              ),
            S.listItem()
              .title("Website text & settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
                  .title("Website text & settings"),
              ),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter((t) => t.schemaType !== "siteSettings"),
  },
  document: {
    actions: (actions, context) =>
      context.schemaType === "siteSettings"
        ? actions.filter(
            (action) =>
              !["delete", "duplicate", "unpublish"].includes(
                action.action || "",
              ),
          )
        : actions,
  },
});
