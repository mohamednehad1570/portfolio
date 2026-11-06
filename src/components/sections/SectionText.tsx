/**
 * SectionText: the text pieces every section shares (ADR 0005), so each role looks and moves the same everywhere.
 *   Eyebrow   section label  -> TextType, ~60 ms per character, cursor hides 0.9 s after typing ends
 *   Heading   H2 / H3 / H1   -> SplitText: words rise 110% -> 0 inside a clip, 70 ms stagger, 700 ms
 *   Intro     intro line     -> BlurText: words blur 8px -> 0 and rise 12px -> 0, 600 ms, ~45 ms stagger
 * Each plays once, when ~20% of it is visible. Body paragraphs use <Reveal from="fade"> instead.
 * Rule 8: all three show their full text without JavaScript and with reduced motion (CSS in sections.css /
 * the vendored components' own rules).
 */
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import BlurText from "../rb/BlurText";
import SplitText from "../rb/SplitText";
import TypedText from "../TypedText";
import { cubicBezier } from "@/lib/bezier";

const RISE_EASE = cubicBezier(0.2, 0.7, 0.2, 1);
// Constants (not inline objects) so the vendored components do not see "new" props on every render.
const RISE_FROM = { yPercent: 110 };
const RISE_TO = { yPercent: 0 };
const BLUR_FROM = { filter: "blur(8px)", opacity: 0, y: 12 };
const BLUR_TO = [{ filter: "blur(0px)", opacity: 1, y: 0 }];
const BLUR_EASE = [0.2, 0.7, 0.2, 1];

/** Section label: types once when it scrolls into view. */
export function Eyebrow({ text }: { text: string }) {
  return <TypedText as="p" className="eyebrow" text={text} speed={60} onView cursor="hide" hideAfter={900} />;
}

/** Headline: words rise out of a per-word clip. `tag` is the real heading level (the page keeps one H1). */
export function Heading({ tag, text, className }: { tag: "h1" | "h2" | "h3"; text: string; className: string }) {
  return (
    <SplitText
      tag={tag}
      text={text}
      className={className}
      splitType="words"
      mask
      from={RISE_FROM}
      to={RISE_TO}
      delay={70}
      duration={0.7}
      ease={RISE_EASE}
      threshold={0.2}
      rootMargin="0px"
      textAlign="left"
      trigger="view"
    />
  );
}

/** Intro line: words blur in and rise. */
export function Intro({ text }: { text: string }) {
  return (
    <BlurText
      text={text}
      className="intro-text blur-text"
      animateBy="words"
      delay={45}
      animationFrom={BLUR_FROM}
      animationTo={BLUR_TO}
      easing={BLUR_EASE}
      stepDuration={0.6}
      threshold={0.2}
      trigger="view"
    />
  );
}

/**
 * RiseWords: the same word-rise as Heading, for a title that is not plain text ("Let's talk." is drawn by
 * VariableProximity, which owns its letters). It finds the words VariableProximity marks with `data-word`
 * and lifts them out of a clip. The "before" position is CSS (`.js [data-rise="pending"] [data-word]`, rule 8),
 * so it only applies once JavaScript runs and never for reduced motion.
 */
export function RiseWords({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-word]"));
    const done = () => {
      el.dataset.rise = "done";
    };
    if (!words.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") {
      done();
      return undefined;
    }
    let tween: gsap.core.Tween | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        tween = gsap.fromTo(
          words,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.7, ease: RISE_EASE, stagger: 0.07, clearProps: "transform", onComplete: done },
        );
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
      done(); // never leave the title hidden (e.g. React strict-mode remount)
    };
  }, []);

  return (
    <h2 ref={ref} className={`${className} rise-clip`} data-rise="pending">
      {children}
    </h2>
  );
}
