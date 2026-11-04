/**
 * Header: site name and section links (text only, no icons). The link of the section on screen is underlined.
 * Why: top bar on desktop, floating pill at the bottom on phones (<=760px, see sections.css) where thumbs reach it.
 */
"use client";

import { site } from "@/content/site";
import { useSiteState } from "./SiteState";

export default function Header() {
  const { active } = useSiteState();
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="#home">
          {site.name}
        </a>
        <nav className="nav-links" aria-label={site.navAriaLabel}>
          {site.nav.map((item) => (
            <a
              key={item.id}
              className={`nav-link${active === item.id ? " is-active" : ""}`}
              href={item.href}
              aria-current={active === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
