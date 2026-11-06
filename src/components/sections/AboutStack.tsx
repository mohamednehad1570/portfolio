/**
 * AboutStack (#about): the four About topics as a transparent "scroll stack" on the normal page scroll (ADR 0003).
 *
 * How it works: each topic is a `position: sticky` item (CSS in sections.css). Items stick one under the other,
 * each a little lower than the last, so the pile of photos grows as you scroll. A GSAP ScrollTrigger reads the
 * scroll position and, for every item, sets one CSS variable, `--depth` (how many newer items have arrived on top
 * of it). CSS turns `--depth` into the visual effect: item scales down, photo dims, text fades out. Only
 * transforms, filter and opacity change, so nothing re-lays-out while scrolling. Nothing is pinned, snapped or
 * captured: the wheel and touch scroll the page as usual.
 *
 *   arrival(i) = clamp(1 - (itemTop - stickyTop) / (STEP * viewport height), 0, 1)   (0 = far below, 1 = stuck)
 *   depth(i)   = sum of arrival(j) for every later item j
 *
 * Text: when an item's arrival first passes 0.55 its title and paragraph reveal word by word, once (WordReveal).
 * Reduced motion / no JavaScript / before hydration: the `is-stack` class is never added, so the topics are a
 * plain list of photo + text, all visible.
 */
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { Eyebrow, Heading } from "./SectionText";
import WordReveal from "./WordReveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Pacing (ADR 0008). Both are shares of the viewport height and are also written to the list as CSS custom
// properties (see below), so the spacing in sections.css and the arrival maths here cannot drift apart.
const STEP = 0.6; // scroll distance from one photo arriving to the next (60svh, about 5 to 6 wheel notches at 900px)
const HOLD = 0.3; // the last photo holds its place this long before the whole stack scrolls away
const REVEAL_AT = 0.55; // arrival at which the words start to appear

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export default function AboutStack() {
  const { about } = site;
  const topics = about.topics;
  const listRef = useRef<HTMLOListElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const motionAllowed = useMotionAllowed();
  const [revealed, setRevealed] = useState<boolean[]>(() => topics.map(() => false)); // text played once per topic

  useGSAP(
    () => {
      const list = listRef.current;
      if (!motionAllowed || !list) return undefined;
      const items = Array.from(list.querySelectorAll<HTMLElement>(".stack-item"));
      const lastDepth = items.map(() => -1);
      const played = items.map(() => false);
      let naturalTop: number[] = []; // where each item sits in the page before it sticks (document px)
      let stickyTop: number[] = []; // the `top` each item sticks at (viewport px)

      // Measured on every refresh (resize, font load, mobile toolbar): no layout reads while scrolling.
      // `span` (px) is the scroll distance between two arrivals. It is read back from the layout (spacing between
      // two items minus one sticky step) instead of computed from innerHeight, so it matches the CSS `svh` spacing
      // exactly even where innerHeight and svh differ (phone toolbars).
      let span = STEP * window.innerHeight;
      const measure = () => {
        const listTop = list.getBoundingClientRect().top + window.scrollY;
        const gap = parseFloat(getComputedStyle(items[0]).marginBottom) || 0; // can be negative
        const flow = items[0].offsetHeight + gap; // distance between two items in the flow
        naturalTop = items.map((_, i) => listTop + i * flow);
        stickyTop = items.map((el) => parseFloat(getComputedStyle(el).top) || 0);
        if (items.length > 1) span = flow - (stickyTop[1] - stickyTop[0]);
      };

      const update = () => {
        const scroll = window.scrollY;
        const arrival = items.map((_, i) => clamp01(1 - (naturalTop[i] - scroll - stickyTop[i]) / span));
        let depth = 0; // sum of the arrivals of all later items, built from the last item backwards
        const justPlayed: number[] = [];
        for (let i = items.length - 1; i >= 0; i--) {
          if (Math.abs(depth - lastDepth[i]) > 0.001) {
            items[i].style.setProperty("--depth", depth.toFixed(3));
            lastDepth[i] = depth;
          }
          if (!played[i] && arrival[i] > REVEAL_AT) {
            played[i] = true;
            justPlayed.push(i);
          }
          depth += arrival[i];
        }
        if (justPlayed.length) {
          setRevealed((prev) => {
            const next = prev.slice();
            justPlayed.forEach((i) => (next[i] = true));
            return next;
          });
        }
      };

      ScrollTrigger.create({
        trigger: list,
        start: "top bottom",
        end: "bottom top",
        onUpdate: update,
        onLeave: update, // make sure the end states (all arrived / none arrived) are applied
        onLeaveBack: update,
        onRefresh: () => {
          measure();
          update();
        },
      });
      measure();
      update();
      return undefined; // useGSAP removes the trigger on cleanup
    },
    { scope: sectionRef, dependencies: [motionAllowed], revertOnUpdate: true },
  );

  return (
    <section id="about" ref={sectionRef} className={`about-stack${motionAllowed ? " is-stack" : ""}`}>
      <div className="wrap about-head">
        <Eyebrow text={about.label} />
        <Heading tag="h2" text={about.title} className="h2" />
      </div>

      <ol ref={listRef} className="wrap stack-list" style={{ "--stack-pace": STEP, "--stack-hold": HOLD } as React.CSSProperties}>
        {topics.map((t, i) => (
          <li key={t.title} className="stack-item" style={{ "--i": i } as React.CSSProperties}>
            <div className="stack-card">
              <figure className="stack-photo">
                {/* "Who I am" reuses the hero photo: it must be eager like the hero, or Next.js warns that the LCP image is lazy */}
                <Image src={t.image} alt="" width={624} height={800} loading={t.image === site.hero.photo.src ? "eager" : "lazy"} />
              </figure>
              <div className="stack-text">
                <WordReveal as="h3" className="stack-title" text={t.title} play={revealed[i]} animate={motionAllowed} stagger={0.08} />
                <WordReveal className="body stack-body" text={t.body} play={revealed[i]} animate={motionAllowed} startDelay={0.26} stagger={0.035} />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
