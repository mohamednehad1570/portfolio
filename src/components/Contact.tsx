/**
 * Contact (#contact): "Let's talk." title, an intro line, and the five rotating contact rings (ContactRings).
 * Why (D17 revised, D6 amended; ADR 0006 and 0007): no menu bands and no booking panel. The call is described in the
 * intro line; "Schedule a call" is the middle ring and points to BOOKING_URL. The title keeps VariableProximity
 * (the letters thicken near the pointer) on top of the word-rise.
 */
"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import VariableProximity from "./rb/VariableProximity";
import ContactRings from "./sections/ContactRings";
import { Eyebrow, Intro, RiseWords } from "./sections/SectionText";

export default function Contact() {
  const { contact } = site;
  const titleBoxRef = useRef<HTMLDivElement>(null);

  return (
    <section id="contact" className="section contact">
      <div className="wrap" ref={titleBoxRef}>
        <Eyebrow text={contact.label} />
        <RiseWords className="h2 vp-title">
          <VariableProximity
            label={contact.title}
            containerRef={titleBoxRef}
            radius={160}
            fromFontVariationSettings="'wght' 500, 'opsz' 48"
            toFontVariationSettings="'wght' 800, 'opsz' 96"
          />
        </RiseWords>
        <Intro text={contact.intro} />
      </div>
      <div className="wrap">
        <ContactRings />
      </div>
    </section>
  );
}
