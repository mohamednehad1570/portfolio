/**
 * Hero (#home): label, the one H1, description, two buttons ("About me", "Book a free call", ADR 0011), and the
 * photo on the other side.
 * Why (D14 revised, ADR 0005): the label types first, then the title; the title's cursor is the only blinking
 * cursor on the page. The description blurs in word by word once the title is typed, and the buttons fade up
 * last. All wording comes from src/content/site.ts.
 * The page waits for nothing visible to be laid out: typed text reserves its final box, so nothing shifts.
 * Rule 8: without JavaScript or with reduced motion everything is simply visible (see TextType.css, sections.css).
 *
 * Photo (D14 as amended by ADR 0013): a frameless transparent cutout standing directly on the starfield. It is the
 * page's LCP element, so it is never hidden: it is opaque in the server HTML (its CSS entrance only slides it, see
 * .hero-photo in sections.css), loads eagerly with high priority, and is preloaded from <head> (`preload` below).
 */
"use client";

import { useState } from "react";
import { preload } from "react-dom";
import { site } from "@/content/site";
import { HERO_IMAGE, HERO_PRELOAD_HREF, HERO_SIZES } from "@/lib/images";
import BlurText from "./rb/BlurText";
import CtaButton from "./CtaButton";
import Picture from "./Picture";
import TypedText from "./TypedText";

// Constants so the vendored BlurText does not see new props on every render.
const WORDS_FROM = { filter: "blur(8px)", opacity: 0, y: 12 };
const WORDS_TO = [{ filter: "blur(0px)", opacity: 1, y: 0 }];
const WORDS_EASE = [0.2, 0.7, 0.2, 1];

export default function Hero() {
  const { hero } = site;
  const [labelDone, setLabelDone] = useState(false);
  const [titleDone, setTitleDone] = useState(false);
  // <link rel="preload" as="image"> in <head> (React hoists it into the static HTML): the photo starts downloading
  // before the body is parsed. type=avif: browsers without AVIF skip it and take WebP from <picture> instead.
  // The href is only React's de-duplication key: with imageSrcSet React leaves it out of the tag, so a browser
  // without imagesrcset support skips the preload (and never fetches the large PNG fallback through it).
  preload(HERO_PRELOAD_HREF, {
    as: "image",
    type: "image/avif",
    imageSrcSet: HERO_IMAGE.avifSrcSet,
    imageSizes: HERO_SIZES,
    fetchPriority: "high",
  });
  return (
    <section id="home" className="hero">
      <div className="wrap hero-grid">
        <div className="hero-text">
          <TypedText
            as="p"
            className="eyebrow"
            text={hero.label}
            speed={34}
            startDelay={200}
            cursor="hide"
            onDone={() => setLabelDone(true)}
          />
          <TypedText
            as="h1"
            className="h1 hero-title"
            text={hero.title}
            speed={40}
            start={labelDone}
            cursor="keep"
            onDone={() => setTitleDone(true)}
          />
          <BlurText
            text={hero.description}
            className="lead blur-text"
            animateBy="words"
            delay={28}
            animationFrom={WORDS_FROM}
            animationTo={WORDS_TO}
            easing={WORDS_EASE}
            stepDuration={0.6}
            trigger="load"
            play={titleDone}
          />
          <div className="actions hero-actions" data-ready={titleDone ? "true" : "false"}>
            <CtaButton href={hero.primaryCta.href}>{hero.primaryCta.label}</CtaButton>
            <CtaButton href={hero.secondaryCta.href}>{hero.secondaryCta.label}</CtaButton>
          </div>
        </div>
        <div className="hero-photo-wrap">
          <Picture className="hero-photo" image={HERO_IMAGE} alt={hero.photo.alt} sizes={HERO_SIZES} priority />
        </div>
      </div>
    </section>
  );
}
