import type { SiteContent } from "./model.ts";

const photo = (src: string, alt: string, position = "50% 50%") => ({
  src,
  alt,
  position,
  width: 1024,
  height: 1536,
});
export const demoContent: SiteContent = {
  mode: "demo",
  production: false,
  siteUrl: "http://localhost:3000",
  settings: {
    brand: "VICREEDART",
    artistName: "Vic",
    readyToPublish: false,
    seoDescription:
      "Coastal mosaic artwork, mosaic surfboards, and custom commissions. Discover the portfolio of VicReedArt.",
    home: {
      title: "VICREEDART",
      subtitle: "Mosaic Artist",
      categories: "Surfboards · Mosaics · Coastal Art",
      hero: {
        ...photo(
          "/images/demo/hero.webp",
          "Illustrative preview: a sea-turtle mosaic surfboard against a sunlit terracotta wall.",
          "75% 50%",
        ),
        width: 1536,
        height: 1024,
      },
      featuredHeading: "Featured work",
      introEyebrow: "A little piece of the coast",
      introTitle: "Inspired by the ocean.\nMade by hand.",
      introText:
        "Color, texture, and a love of the coast, brought together one small piece at a time. Explore mosaic surfboards and artwork with a story of their own.",
    },
    work: { title: "My work", subtitle: "One-of-a-kind mosaic pieces" },
    about: {
      title: "Hi, I’m Vic.",
      paragraphs: [
        "I’m a coastal mosaic artist, creating surfboards, mosaics, and artwork inspired by the ocean.",
        "This is a space for my story: the places, materials, and moments that inspire the work. My full biography and studio details will be added here before the website launches.",
        "Each piece begins with an idea and comes together slowly, one tile at a time.",
      ],
      portrait: photo(
        "/images/demo/studio.webp",
        "Illustrative preview of hands arranging ceramic tiles in a coastal mosaic studio.",
      ),
      portraitCaption:
        "Studio image and biography are temporary preview content.",
      location: "Studio location to be added",
      statement: "Art inspired by the ocean",
    },
    commissions: {
      title: "Let’s create something together",
      subtitle: "Interested in a custom mosaic?",
      introduction:
        "A favorite place. A meaningful memory. A little piece of the sea. Share your idea for a mosaic surfboard or coastal artwork, and let’s explore what it could become.",
      isOpen: true,
      closedMessage:
        "Commissions are currently closed. Please check back for the next opening.",
      image: photo(
        "/images/demo/shore.webp",
        "Illustrative coastal preview: palm fronds frame a quiet turquoise sea.",
      ),
      note: "Custom pieces for\nspecial places, people\nand moments.",
      privacyNote:
        "Your details and reference images are used only to respond to your inquiry. Please share only images you have permission to use.",
      successMessage:
        "Thank you for sharing your idea. Your inquiry has been sent, and Vic will be in touch by email.",
    },
    contactEmail: "",
    socialLinks: [],
    footerLine: "Coastal mosaics. Made one piece at a time.",
  },
  artworks: [
    {
      id: "demo-turtle",
      title: "Sea Turtle",
      slug: "sea-turtle",
      images: [
        {
          ...photo(
            "/images/demo/hero.webp",
            "Illustrative sample: sea-turtle mosaic surfboard.",
            "80% 50%",
          ),
          width: 1536,
          height: 1024,
        },
      ],
      price: null,
      currency: "USD",
      status: "sold",
      category: "surfboard",
      dimensions: "",
      materials: "",
      year: null,
      description: [
        "A sample artwork entry showing how a finished piece will appear in the portfolio. Replace this illustration and text with original photographs and approved artwork details in Sanity.",
      ],
      featured: true,
      displayOrder: 10,
      commissionCta: "Ask about something similar",
      isDemo: true,
    },
    {
      id: "demo-wave",
      title: "Ocean Breeze",
      slug: "ocean-breeze",
      images: [
        photo(
          "/images/demo/wave.webp",
          "Illustrative sample: aqua and ivory wave mosaic surfboard.",
        ),
      ],
      price: null,
      currency: "USD",
      status: "available",
      category: "surfboard",
      dimensions: "",
      materials: "",
      year: null,
      description: [
        "A sample artwork entry for the website preview. Artwork imagery, availability, and descriptions must be replaced with approved information before launch.",
      ],
      featured: true,
      displayOrder: 20,
      commissionCta: "Ask about this piece",
      isDemo: true,
    },
    {
      id: "demo-tide",
      title: "Blue Tide",
      slug: "blue-tide",
      images: [
        photo(
          "/images/demo/tide.webp",
          "Illustrative sample: indigo and pale blue turtle mosaic surfboard.",
        ),
      ],
      price: null,
      currency: "USD",
      status: "sold",
      category: "surfboard",
      dimensions: "",
      materials: "",
      year: null,
      description: [
        "A sample artwork entry for the website preview. This illustration is not a photograph of the artist’s work. Final dimensions, materials, and year will appear here when supplied.",
      ],
      featured: true,
      displayOrder: 30,
      commissionCta: "Ask about something similar",
      isDemo: true,
    },
    {
      id: "demo-island",
      title: "Island Vibes",
      slug: "island-vibes",
      images: [
        photo(
          "/images/demo/island.webp",
          "Illustrative sample: sunset and palm-tree mosaic surfboard.",
        ),
      ],
      price: null,
      currency: "USD",
      status: "sold",
      category: "surfboard",
      dimensions: "",
      materials: "",
      year: null,
      description: [
        "A sample artwork entry for the website preview. The artist will manage the final photographs, description, price, and availability in Sanity.",
      ],
      featured: true,
      displayOrder: 40,
      commissionCta: "Ask about something similar",
      isDemo: true,
    },
  ],
};
