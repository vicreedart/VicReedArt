import type { ComponentProps } from "react";

// Static HTML navigation avoids speculative RSC requests on the asset-only host.
export function SiteLink(props: ComponentProps<"a">) {
  return <a {...props} />;
}
