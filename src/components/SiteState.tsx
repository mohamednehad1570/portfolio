/**
 * SiteState: small shared state for the one-page site (which section is on screen) plus the night-sky background layer.
 * Why: the header underline depends on where the visitor is, so one observer feeds it instead of each section
 * watching the scroll. The background lives here
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
};

const SiteStateContext = createContext<State>({
  active: "home",
});

export const useSiteState = () => useContext(SiteStateContext);

export function SiteStateProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<SectionId>("home");
  const [starsOn, setStarsOn] = useState(false); // mount the starfield only once the browser is idle

  // Scrollspy: the section with the most visible pixels is "active".
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

  const value = useMemo(() => ({ active }), [active]);

  return (
    <SiteStateContext.Provider value={value}>
      {starsOn && <StarfieldBackground />}
      {children}
    </SiteStateContext.Provider>
  );
}
