import { SiteLink as Link } from "@/components/site-link";
import { WaveMark } from "@/components/wave";
export default function NotFound() {
  return (
    <main id="main-content" className="not-found content-width">
      <WaveMark />
      <p className="eyebrow">404 · A little off course</p>
      <h1>This page has drifted away.</h1>
      <p>There’s still plenty to discover in the gallery.</p>
      <Link className="button" href="/work/">
        Explore the work →
      </Link>
    </main>
  );
}
