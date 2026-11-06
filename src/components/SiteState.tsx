/**
 * SiteState: small shared state for the one-page site (which section is on screen, whether Contact has been
 * reached, or the visitor is using the keyboard) plus the night-sky background layer.
 * Why: the header underline, the go-to-top button and the contact menu all depend on where the visitor is,
 * so one observer feeds them all instead of each section watching the scroll. The background lives here
 * because it is one fixed layer behind every section; it loads client-only, after the page text.
 */
"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { preloadWhenIdle } from "@/lib/useMotionAllowed";

gsap.registerPlugin(ScrollTrigger);

// next/dynamic with ssr:false is only allowed in a Client Component. The canvas code is its own chunk, so it
// never blocks the first paint of the headline; until it arrives the page is plain #0a1626 (no layout shift).
const StarfieldBackground = dynamic(() => import("./StarfieldBackground"), { ssr: false, loading: () => null });

export type SectionId = "home" | "about" | "projects" | "contact";
const SECTION_IDS: SectionId[] = ["home", "about", "projects", "contact"];

type State = {
  active: SectionId;
  contactSeen: boolean;
};

const SiteStateContext = createContext<State>({
  active: "home",
  contactSeen: false,
});

export const useSiteState = () => useContext(SiteStateContext);

export function SiteStateProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<SectionId>("home");
  const [contactSeen, setContactSeen] = useState(false);
  const [starsOn, setStarsOn] = useState(false); // mount the starfield only once the browser is idle

  // Scrollspy: the section with the most visible pixels is "active". Also flags when Contact is ~25% visible,
  // so its flowing menu is mounted only when the visitor can see its intro.
  useEffect(() => {
    const seen: Partial<Record<SectionId, number>> = {};
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          seen[e.target.id as SectionId] = e.intersectionRect.height;
        });
        let best: SectionId = "home";
        SECTION_IDS.forEach((id) => {
          if ((seen[id] ?? 0) > (seen[best] ?? 0)) best = id;
        });
        setActive(best);
        if ((seen.contact ?? 0) > window.innerHeight * 0.25) setContactSeen(true);
      },
      // Fine steps (1%): About is several screens tall, so its visible share changes slowly and a coarse
      // 5% step would report the wrong section for hundreds of pixels.
      { threshold: Array.from({ length: 101 }, (_, i) => i / 100) },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Keyboard users: the contact menu is only mounted once Contact is on screen, so without this the first Tab
  // press would skip its rows (the focus would jump from the Projects buttons straight to the footer).
  // Pressing Tab even once mounts it, so every row is in the tab order.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") setContactSeen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Start the sky after the main content has painted (idle time), so it never competes with the headline.
  useEffect(
    () =>
      preloadWhenIdle(() => {
        setStarsOn(true);
      }),
    [],
  );

  // Web fonts change text sizes, so every scroll position (pin start/end) must be measured again once they load.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  const value = useMemo(
    () => ({ active, contactSeen }),
    [active, contactSeen],
  );

  return (
    <SiteStateContext.Provider value={value}>
      {starsOn && <StarfieldBackground />}
      {children}
    </SiteStateContext.Provider>
  );
}
