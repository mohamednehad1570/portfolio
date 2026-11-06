/**
 * About (#about): a curved photo gallery pinned to the screen while the visitor scrolls.
 * Why (D15): scrolling turns the gallery one photo at a time, snapping on each of the 4 photos
 * (progress 0, 1/3, 2/3, 1), then releases the page. The paragraph for the centred photo sits underneath.
 * Horizontal drag/swipe also turns the gallery; a vertical wheel is never trapped (see rb/README.md).
 *
 * Quality pass: the gallery chunk loads lazily with a static photo as fallback. With
 * `prefers-reduced-motion: reduce` nothing is pinned or animated: the pinned block is hidden by CSS and the
 * 4 topics show as a plain photo + text list instead.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import { INK } from "@/lib/theme";
import { preloadWhenIdle, useMotionAllowed } from "@/lib/useMotionAllowed";
import BlurText from "./rb/BlurText";
import SplitText from "./rb/SplitText";
import TodoText from "./TodoText";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const loadGallery = () => import("./rb/CircularGallery");

/** Static stand-in while the WebGL gallery downloads (and for first paint): the first photo and its title. */
function GalleryFallback() {
  const first = site.about.topics[0];
  return (
    <figure className="gallery-fallback">
      <Image src={first.image} alt="" width={624} height={800} priority />
      <figcaption>{first.title}</figcaption>
    </figure>
  );
}

const CircularGallery = dynamic(loadGallery, { ssr: false, loading: () => <GalleryFallback /> });

export default function About() {
  const { about } = site;
  const topics = about.topics;
  const sectionRef = useRef<HTMLElement>(null);
  const motionAllowed = useMotionAllowed();
  const [slide, setSlide] = useState(0); // gallery position driven by page scroll
  const [shown, setShown] = useState(0); // topic whose paragraph is shown (follows the gallery)

  useEffect(() => preloadWhenIdle(loadGallery), []);

  // Pin the section for (n-1) steps of 70% of the screen height; snap to each photo. Skipped for reduced motion.
  useGSAP(
    () => {
      if (!motionAllowed) return undefined;
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
      });
      return undefined; // useGSAP kills the trigger on cleanup
    },
    { scope: sectionRef, dependencies: [motionAllowed], revertOnUpdate: true },
  );

  return (
    <section id="about" ref={sectionRef} className="about">
      <div className="wrap about-head">
        <p className="eyebrow">{about.label}</p>
        <SplitText tag="h2" text={about.title} className="h2" splitType="words" delay={60} textAlign="left" trigger="view" />
      </div>

      {/* Pinned, animated version (hidden when the visitor prefers reduced motion) */}
      <div className="about-pinned">
        <div className="gallery">
          {motionAllowed ? (
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
          ) : (
            <GalleryFallback />
          )}
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
      </div>

      {/* Reduced-motion version: every topic as a simple photo + text card (shown only by CSS) */}
      <ol className="wrap about-list">
        {topics.map((t) => (
          <li key={t.title}>
            {/* "Who I am" reuses the hero photo: it must be eager like the hero copy, or Next.js warns that the LCP image is lazy */}
            <Image src={t.image} alt="" width={624} height={800} loading={t.image === site.hero.photo.src ? "eager" : "lazy"} />
            <h3 className="h3">{t.title}</h3>
            <p className="body">
              <TodoText text={t.body} />
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
