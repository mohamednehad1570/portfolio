/**
 * SiteState: small shared state for the one-page site (which section is on screen, whether About is pinned,
 * whether Contact has been reached) plus the cubes layer that reacts to it.
 * Why: the header underline, the go-to-top button, the cubes pause and the contact menu all depend on
 * where the visitor is, so one observer feeds them all instead of each section watching the scroll.
 */
"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CubesLayer from "./CubesLayer";
import { ACCENT } from "@/lib/theme";

gsap.registerPlugin(ScrollTrigger);

export type SectionId = "home" | "about" | "projects" | "contact";
const SECTION_IDS: SectionId[] = ["home", "about", "projects", "contact"];

type State = {
  active: SectionId;
  aboutPinned: boolean;
  setAboutPinned: (pinned: boolean) => void;
  contactSeen: boolean;
};

const SiteStateContext = createContext<State>({
  active: "home",
  aboutPinned: false,
  setAboutPinned: () => {},
  contactSeen: false,
});

export const useSiteState = () => useContext(SiteStateContext);

export function SiteStateProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<SectionId>("home");
  const [aboutPinned, setAboutPinned] = useState(false);
  const [contactSeen, setContactSeen] = useState(false);

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
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  // Web fonts change text sizes, so every scroll position (pin start/end) must be measured again once they load.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
  }, []);

  const value = useMemo(
    () => ({ active, aboutPinned, setAboutPinned, contactSeen }),
    [active, aboutPinned, contactSeen],
  );

  return (
    <SiteStateContext.Provider value={value}>
      {/* The cubes pause while About is pinned (the gallery needs the GPU); see D8 */}
      <CubesLayer color={ACCENT} lineAlpha={0.22} paused={aboutPinned} />
      {children}
    </SiteStateContext.Provider>
  );
}
