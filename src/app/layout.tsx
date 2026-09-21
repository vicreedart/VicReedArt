import type { Metadata } from "next";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/caveat/400.css";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { settings, content, isPreview, absoluteUrl } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(content.siteUrl),
  title: {
    default: `${settings.brand} — Coastal Mosaic Art`,
    template: `%s | ${settings.brand}`,
  },
  description: settings.seoDescription,
  robots: isPreview
    ? { index: false, follow: false }
    : { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: settings.brand,
    title: `${settings.brand} — Mosaic Artist`,
    description: settings.seoDescription,
    images: [
      { url: absoluteUrl(settings.home.hero.src), alt: settings.home.hero.alt },
    ],
  },
  twitter: { card: "summary_large_image" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {isPreview ? (
          <div className="preview-notice">
            {content.mode === "demo" ||
            content.artworks.some((art) => art.isDemo)
              ? "Design preview · Illustrative artwork & sample copy"
              : "Site preview · Inquiries are disabled"}
            <span>Not the live portfolio</span>
          </div>
        ) : null}
        <Header brand={settings.brand} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
