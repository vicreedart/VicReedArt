import data from "./generated.json";
import type { SiteContent } from "./model";
export const content = data as SiteContent;
export const settings = content.settings;
export const artworks = content.artworks;
export const isPreview = !content.production;
export function absoluteUrl(path = "/") {
  return new URL(path, content.siteUrl).toString();
}
export function artworkPrice(value: number | null, currency: string) {
  return value === null
    ? null
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(value);
}
