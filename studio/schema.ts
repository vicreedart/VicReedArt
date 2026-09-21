import { defineType, defineField } from "sanity";
const required = (name: string, title: string, type = "string") =>
  defineField({ name, title, type, validation: (r) => r.required() });
const paragraphs = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [{ type: "text", rows: 4 }],
    validation: (r) => r.required().min(1),
    description:
      "Each item is one paragraph. Add or drag paragraphs to change their order.",
  });
const photo = defineType({
  name: "artPhoto",
  title: "Photograph",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Describe the photograph",
      type: "string",
      description:
        "A short description for people who cannot see the image. Describe the artwork, colors, and subject.",
      validation: (r) => r.required().min(3).max(250),
    }),
    defineField({
      name: "position",
      title: "Image focal position",
      type: "string",
      initialValue: "50% 50%",
      options: {
        list: [
          { title: "Center", value: "50% 50%" },
          { title: "Top", value: "50% 20%" },
          { title: "Left", value: "25% 50%" },
          { title: "Right", value: "75% 50%" },
        ],
      },
      description:
        "Choose which part stays visible when a photograph is cropped to fit the layout.",
    }),
  ],
});
const artwork = defineType({
  name: "artwork",
  title: "Artwork",
  type: "document",
  initialValue: {
    currency: "USD",
    status: "available",
    category: "surfboard",
    featured: false,
    displayOrder: 10,
    archived: false,
    isDemo: false,
    commissionCta: "Ask about something similar",
  },
  fields: [
    required("title", "Artwork title"),
    defineField({
      name: "slug",
      title: "Page address",
      type: "slug",
      options: { source: "title", maxLength: 90 },
      description:
        "Use Generate after entering a title. Keep this unchanged after publishing to preserve shared links.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "images",
      title: "Artwork photographs",
      type: "array",
      of: [{ type: "artPhoto" }],
      description:
        "The first photograph is the gallery cover. Drag to reorder.",
      validation: (r) => r.required().min(1).max(12),
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      description: "Leave empty to hide the price.",
      validation: (r) => r.min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "USD",
      options: { list: ["USD", "GBP", "EUR", "CAD", "AUD"] },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Availability",
      type: "string",
      options: {
        list: [
          { title: "Available", value: "available" },
          { title: "Sold", value: "sold" },
          { title: "Not for sale", value: "not-for-sale" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Type of artwork",
      type: "string",
      options: {
        list: [
          { title: "Surfboard", value: "surfboard" },
          { title: "Mosaic", value: "mosaic" },
          { title: "Coastal art", value: "coastal-art" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions",
      type: "string",
      description: "Include units, for example 12 × 36 inches.",
    }),
    defineField({ name: "materials", title: "Materials", type: "string" }),
    defineField({
      name: "year",
      title: "Year made",
      type: "number",
      validation: (r) => r.integer().min(1900).max(2100),
    }),
    paragraphs("description", "About this artwork"),
    defineField({
      name: "featured",
      title: "Feature on homepage",
      type: "boolean",
      description:
        "The first four featured pieces, in display order, appear on the homepage.",
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      description:
        "Lower numbers appear first. Use 10, 20, 30… to leave space for new pieces.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "commissionCta",
      title: "Inquiry button text",
      type: "string",
      description: "Leave empty to hide the inquiry button.",
    }),
    defineField({
      name: "archived",
      title: "Hide from website",
      type: "boolean",
      description: "Archive a piece without deleting its content.",
    }),
    defineField({
      name: "isDemo",
      title: "Temporary sample artwork",
      type: "boolean",
      description: "Sample artwork cannot appear on the production website.",
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrder",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      media: "images.0",
      status: "status",
      archived: "archived",
    },
    prepare: ({ title, media, status, archived }) => ({
      title,
      media,
      subtitle: archived ? "Hidden from website" : status,
    }),
  },
});
const siteSettings = defineType({
  name: "siteSettings",
  title: "Website text & settings",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "home", title: "Homepage" },
    { name: "work", title: "Gallery" },
    { name: "about", title: "About" },
    { name: "commissions", title: "Commissions" },
    { name: "contact", title: "Contact & launch" },
  ],
  fields: [
    { ...required("brand", "Brand name"), group: "identity" },
    { ...required("artistName", "Artist name"), group: "identity" },
    defineField({
      name: "seoDescription",
      title: "Short website description",
      type: "text",
      rows: 3,
      group: "identity",
      validation: (r) => r.required().min(20).max(200),
    }),
    defineField({
      name: "home",
      title: "Homepage",
      type: "object",
      group: "home",
      fields: [
        required("title", "Hero title"),
        required("subtitle", "Hero subtitle"),
        required("categories", "Category line"),
        required("hero", "Hero photograph", "artPhoto"),
        required("featuredHeading", "Featured artwork heading"),
        required("introEyebrow", "Studio introduction — small heading"),
        required("introTitle", "Studio introduction — title"),
        required("introText", "Studio introduction — text", "text"),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "work",
      title: "Gallery",
      type: "object",
      group: "work",
      fields: [
        required("title", "Page title"),
        required("subtitle", "Subtitle"),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "about",
      title: "About the artist",
      type: "object",
      group: "about",
      fields: [
        required("title", "Heading"),
        paragraphs("paragraphs", "Biography"),
        required("portrait", "Artist photograph", "artPhoto"),
        defineField({
          name: "portraitCaption",
          title: "Photograph caption",
          type: "string",
        }),
        defineField({
          name: "location",
          title: "General studio location",
          type: "string",
          description:
            "A town or region is enough. Do not publish your home address.",
        }),
        required("statement", "Handwritten artistic statement"),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "commissions",
      title: "Commissions",
      type: "object",
      group: "commissions",
      fields: [
        required("title", "Page title"),
        required("subtitle", "Subtitle"),
        required("introduction", "Introduction", "text"),
        defineField({
          name: "isOpen",
          title: "Accepting commissions",
          type: "boolean",
          initialValue: false,
        }),
        required(
          "closedMessage",
          "Message when commissions are closed",
          "text",
        ),
        required("image", "Coastal photograph", "artPhoto"),
        required("note", "Handwritten image caption", "text"),
        required("privacyNote", "Privacy note below the form", "text"),
        required(
          "successMessage",
          "Confirmation after a successful inquiry",
          "text",
        ),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "contactEmail",
      title: "Public contact email",
      type: "string",
      group: "contact",
      validation: (r) => r.email(),
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      group: "contact",
      of: [
        {
          type: "object",
          fields: [
            required("label", "Name, such as Instagram"),
            defineField({
              name: "url",
              title: "Full link",
              type: "url",
              validation: (r) => r.required().uri({ scheme: ["https"] }),
            }),
          ],
        },
      ],
    }),
    { ...required("footerLine", "Footer sentence"), group: "contact" },
    defineField({
      name: "readyToPublish",
      title: "Content approved for launch",
      type: "boolean",
      initialValue: false,
      group: "contact",
      description:
        "Enable only after replacing all sample photographs and text and checking contact details. This allows a production build.",
    }),
  ],
  preview: { prepare: () => ({ title: "Website text & settings" }) },
});
export const schemaTypes = [photo, artwork, siteSettings];
