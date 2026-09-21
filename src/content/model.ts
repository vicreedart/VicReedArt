import { z } from "zod";

export const imageSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(3),
  width: z.number().positive().default(1200),
  height: z.number().positive().default(1800),
  position: z.string().default("50% 50%"),
});
export const artworkSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  images: z.array(imageSchema).min(1).max(12),
  price: z.number().nonnegative().nullable().default(null),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/)
    .default("USD"),
  status: z.enum(["available", "sold", "not-for-sale"]),
  category: z.enum(["surfboard", "mosaic", "coastal-art"]),
  dimensions: z.string().default(""),
  materials: z.string().default(""),
  year: z.number().int().min(1900).max(2100).nullable().default(null),
  description: z.array(z.string()).min(1),
  featured: z.boolean().default(false),
  displayOrder: z.number().default(0),
  commissionCta: z.string().default("Ask about something similar"),
  isDemo: z.boolean().default(false),
});
export const settingsSchema = z.object({
  brand: z.string().min(1),
  artistName: z.string().min(1),
  seoDescription: z.string().min(20).max(200),
  readyToPublish: z.boolean().default(false),
  home: z.object({
    title: z.string(),
    subtitle: z.string(),
    categories: z.string(),
    hero: imageSchema,
    featuredHeading: z.string(),
    introEyebrow: z.string(),
    introTitle: z.string(),
    introText: z.string(),
  }),
  work: z.object({ title: z.string(), subtitle: z.string() }),
  about: z.object({
    title: z.string(),
    paragraphs: z.array(z.string()).min(1),
    portrait: imageSchema,
    portraitCaption: z.string().default(""),
    location: z.string().default(""),
    statement: z.string(),
  }),
  commissions: z.object({
    title: z.string(),
    subtitle: z.string(),
    introduction: z.string(),
    isOpen: z.boolean(),
    closedMessage: z.string(),
    image: imageSchema,
    note: z.string(),
    privacyNote: z.string(),
    successMessage: z.string(),
  }),
  contactEmail: z.union([z.literal(""), z.email()]).default(""),
  socialLinks: z
    .array(
      z.object({
        label: z.string(),
        url: z
          .url()
          .refine((u) => u.startsWith("https://"), "Use an HTTPS URL"),
      }),
    )
    .default([]),
  footerLine: z.string(),
});
export const contentSchema = z.object({
  settings: settingsSchema,
  artworks: z.array(artworkSchema).max(500),
});
export type Artwork = z.infer<typeof artworkSchema>;
export type ArtworkImage = z.infer<typeof imageSchema>;
export type SiteSettings = z.infer<typeof settingsSchema>;
export type SiteContent = z.infer<typeof contentSchema> & {
  mode: "demo" | "sanity";
  production: boolean;
  siteUrl: string;
};
