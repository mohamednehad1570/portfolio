/**
 * Contact (#contact): "Let's talk." title, then a FlowingMenu with always-on moving bands, then the
 * "Book a free call" panel (a placeholder where the Cal.com embed will go later).
 * Why (D17): rows alternate blue / transparent bands, a round photo spins between the repeated labels.
 * The menu mounts only once Contact is ~25% visible (SiteState), so its intro animation is actually seen.
 */
"use client";

import { useRef } from "react";
import { site } from "@/content/site";
import { ACCENT, INK, LINE } from "@/lib/theme";
import FlowingMenu from "./rb/FlowingMenu";
import ScrollReveal from "./rb/ScrollReveal";
import VariableProximity from "./rb/VariableProximity";
import Reveal from "./Reveal";
import { useSiteState } from "./SiteState";

const BANDS = {
  blue: { bandColor: ACCENT, bandText: "#ffffff" },
  clear: { bandColor: "transparent", bandText: INK },
};

export default function Contact() {
  const { contact } = site;
  const { contactSeen } = useSiteState();
  const titleBoxRef = useRef<HTMLDivElement>(null);

  // Map content rows to the FlowingMenu item shape; http(s) links open in a new tab.
  const items = contact.rows.map((row) => ({
    text: row.label,
    marquee: row.marquee,
    link: row.href,
    image: contact.image,
    external: /^https?:/.test(row.href),
    ...BANDS[row.band],
  }));

  return (
    <section id="contact" className="section contact">
      <div className="wrap" ref={titleBoxRef}>
        <p className="eyebrow">{contact.label}</p>
        <h2 className="h2 vp-title">
          <VariableProximity
            label={contact.title}
            containerRef={titleBoxRef}
            radius={160}
            fromFontVariationSettings="'wght' 500, 'opsz' 48"
            toFontVariationSettings="'wght' 800, 'opsz' 96"
          />
        </h2>
        <ScrollReveal baseOpacity={0.15} enableBlur blurStrength={4} baseRotation={0} containerClassName="intro" textClassName="intro-text">
          {contact.intro}
        </ScrollReveal>
      </div>
      <div className="menu-box">
        {contactSeen && (
          <FlowingMenu
            items={items}
            alwaysOn
            direction="alternate"
            speed={55}
            stretch={0.6}
            magnet={0.25}
            followCursor={0.4}
            textColor={INK}
            bgColor="transparent"
            marqueeBgColor={ACCENT}
            marqueeTextColor="#ffffff"
            borderColor={LINE}
            imageShape="circle"
            ariaLabel={contact.menuAriaLabel}
          />
        )}
      </div>
      <div id="book" className="wrap book">
        <Reveal className="book-panel">
          <h3 className="h3">{contact.book.title}</h3>
          <p className="body">{contact.book.body}</p>
          <div className="book-slot">{contact.book.slot}</div>
        </Reveal>
      </div>
    </section>
  );
}
