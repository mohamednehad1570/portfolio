/**
 * Header: site name and section links (text only, no icons). The link of the section on screen is underlined.
 * Why: top bar on desktop and tablet. Batch 12: hidden below 768 px, where the bubble menu (MobileMenu) and the
 * name at the top of the hero replace it (the old floating bottom pill is gone).
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
