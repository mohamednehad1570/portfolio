/**
 * ToTop: floating round "go to top" arrow, the only icon on the site (D19).
 * Why: appears once the visitor has left the hero; on phones it sits above the bottom navigation pill.
 * While hidden it is also removed from tab order and from screen readers.
 */
"use client";

import { site } from "@/content/site";
import { useSiteState } from "./SiteState";

export default function ToTop() {
  const { active } = useSiteState();
  const shown = active !== "home";
  return (
    <a
      className={`to-top${shown ? " is-shown" : ""}`}
      href="#home"
      aria-label={site.toTopLabel}
      tabIndex={shown ? 0 : -1}
      aria-hidden={shown ? undefined : true}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </a>
  );
}
