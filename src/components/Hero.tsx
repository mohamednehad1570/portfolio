/**
 * Hero (#home): label, the one H1, description, two calls to action, and the photo on the other side.
 * Why (D14 revised, ADR 0005): the label types first, then the title; the title's cursor is the only blinking
 * cursor on the page. The description blurs in word by word once the title is typed, and the buttons fade up
 * last. The photo slides in from the right. All wording comes from src/content/site.ts.
 * The page waits for nothing visible to be laid out: typed text reserves its final box, so nothing shifts.
 * Rule 8: without JavaScript or with reduced motion everything is simply visible (see TextType.css, sections.css).
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import { site } from "@/content/site";
import BlurText from "./rb/BlurText";
import CtaButton from "./CtaButton";
import Reveal from "./Reveal";
import TypedText from "./TypedText";

// Constants so the vendored BlurText does not see new props on every render.
const WORDS_FROM = { filter: "blur(8px)", opacity: 0, y: 12 };
const WORDS_TO = [{ filter: "blur(0px)", opacity: 1, y: 0 }];
const WORDS_EASE = [0.2, 0.7, 0.2, 1];

export default function Hero() {
  const { hero } = site;
  const [labelDone, setLabelDone] = useState(false);
  const [titleDone, setTitleDone] = useState(false);
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
            <a className="text-link" href={hero.secondaryLink.href}>
              {hero.secondaryLink.label}
            </a>
          </div>
        </div>
        <Reveal from="right" delay={250} className="hero-photo-wrap">
          <figure className="hero-photo">
            <Image src={hero.photo.src} alt={hero.photo.alt} width={340} height={425} priority sizes="(max-width: 760px) 280px, 420px" />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
