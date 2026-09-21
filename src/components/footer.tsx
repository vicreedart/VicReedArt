import { SiteLink as Link } from "@/components/site-link";
import { settings } from "@/content/site";
import { WaveMark } from "./wave";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <Link href="/" className="footer-brand">
          <WaveMark />
          <span>{settings.brand}</span>
        </Link>
        <p>{settings.footerLine}</p>
        <div className="footer-links">
          {settings.socialLinks.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
              <span className="sr-only"> (opens a new tab)</span>
            </a>
          ))}
          {settings.contactEmail ? (
            <a href={`mailto:${settings.contactEmail}`}>Get in touch</a>
          ) : (
            <Link href="/commissions/">Commissions</Link>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getUTCFullYear()} {settings.brand}
        </span>
        <Link href="/privacy/">Privacy</Link>
      </div>
    </footer>
  );
}
