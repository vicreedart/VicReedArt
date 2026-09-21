"use client";
import { SiteLink as Link } from "@/components/site-link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { WaveMark } from "./wave";
const links = [
  ["/", "Home"],
  ["/work/", "My work"],
  ["/about/", "About"],
  ["/commissions/", "Commissions"],
];
export function Header({ brand }: { brand: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header
      className="site-header"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
        }
      }}
    >
      <div className="header-inner">
        <Link
          href="/"
          className="brand-mark"
          aria-label={`${brand} — home`}
          onClick={() => setOpen(false)}
        >
          <WaveMark />
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? "Close" : "Menu"}
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
        <nav
          id="primary-navigation"
          aria-label="Main navigation"
          className={open ? "main-nav is-open" : "main-nav"}
        >
          {links.map(([href, label]) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href.replace(/\/$/, ""));
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
