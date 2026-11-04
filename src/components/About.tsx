/**
 * About (#about): a curved photo gallery pinned to the screen while the visitor scrolls.
 * Why (D15): scrolling turns the gallery one photo at a time, snapping on each of the 4 photos
 * (progress 0, 1/3, 2/3, 1), then releases the page. The paragraph for the centred photo sits underneath.
 * Horizontal drag/swipe also turns the gallery; a vertical wheel is never trapped (see rb/README.md).
 * While pinned the cubes background pauses (state in SiteState).
 */
"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import { INK } from "@/lib/theme";
import BlurText from "./rb/BlurText";
import CircularGallery from "./rb/CircularGallery";
import SplitText from "./rb/SplitText";
import { useSiteState } from "./SiteState";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function About() {
  const { about } = site;
  const topics = about.topics;
  const sectionRef = useRef<HTMLElement>(null);
  const { setAboutPinned } = useSiteState();
  const [slide, setSlide] = useState(0); // gallery position driven by page scroll
  const [shown, setShown] = useState(0); // topic whose paragraph is shown (follows the gallery)

  // Pin the section for (n-1) steps of 70% of the screen height; snap to each photo.
  useGSAP(
    () => {
      const n = topics.length;
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: () => `+=${Math.round(window.innerHeight * 0.7 * (n - 1))}`,
        pin: true,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.5 }, delay: 0.08, ease: "power1.inOut" },
        onUpdate: (self) => {
          const i = Math.min(n - 1, Math.round(self.progress * (n - 1)));
          setSlide((prev) => (prev === i ? prev : i));
        },
        onToggle: (self) => setAboutPinned(self.isActive),
      });
      // useGSAP kills this trigger when the component unmounts
      return () => setAboutPinned(false);
    },
    { scope: sectionRef },
  );

  return (
    <section id="about" ref={sectionRef} className="about">
      <div className="wrap about-head">
        <p className="eyebrow">{about.label}</p>
        <SplitText tag="h2" text={about.title} className="h2" splitType="words" delay={60} textAlign="left" trigger="view" />
      </div>
      <div className="gallery">
        <CircularGallery
          items={topics.map((t) => ({ text: t.title, image: t.image }))}
          activeIndex={slide}
          onActiveChange={setShown}
          bend={2}
          textColor={INK}
          font="600 30px var(--font-display)"
          borderRadius={0.04}
          scrollEase={0.07}
          itemSize={1}
          openOnClick={false}
          fadeEdges={0.1}
          shadow={0.15}
        />
      </div>
      <div className="wrap about-copy">
        <BlurText key={shown} text={topics[shown].body} className="about-body" animateBy="words" delay={22} trigger="load" />
        <ol className="dots" aria-label={about.dotsAriaLabel}>
          {topics.map((t, i) => (
            <li key={t.title} className={i === shown ? "is-on" : ""}>
              <span className="sr-only">{t.title}</span>
            </li>
          ))}
        </ol>
        <p className="hint">{about.hint}</p>
      </div>
    </section>
  );
}
