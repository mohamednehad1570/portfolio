/**
 * ToTop: floating round "go to top" arrow, the only icon on the site (D19).
 * Why: desktop and tablet: appears once the visitor has left the hero. Phones (below 768 px, batch 12): a 48 px glass
 * circle bottom-right that appears after 160 px of scroll (an IntersectionObserver on a 160 px tall marker at the top
 * of the page, so no scroll listener) and hides while the mobile menu is open (CSS on html[data-menu-open]).
 * While hidden it is also removed from tab order and from screen readers.
 */
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { site } from "@/content/site";
import { useSiteState } from "./SiteState";

const PHONE = "(max-width: 767px)";
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

export default function ToTop() {
  const { active } = useSiteState();
  const phone = useSyncExternalStore(subscribe, () => window.matchMedia(PHONE).matches, () => false);
  const markerRef = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false); // more than 160 px down the page

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return undefined;
    const io = new IntersectionObserver(([entry]) => setScrolled(!entry.isIntersecting));
    io.observe(marker);
    return () => io.disconnect();
  }, []);

  const shown = phone ? scrolled : active !== "home";
  return (
    <>
      <span ref={markerRef} className="to-top-marker" aria-hidden="true" />
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
    </>
  );
}
