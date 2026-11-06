/**
 * Contact (#contact): "Let's talk." title, then a FlowingMenu with always-on moving bands, then the
 * "Book a free call" panel (a placeholder where the Cal.com embed will go later).
 * Why (D17): rows alternate blue / transparent bands, a round photo spins between the repeated labels.
 * The menu mounts only once Contact is ~25% visible (SiteState), so its intro animation is actually seen.
 * Its code loads lazily (preloaded when the browser is idle); a plain link list is the fallback.
 */
"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { site } from "@/content/site";
import { ACCENT_STRONG, INK, LINE } from "@/lib/theme";
import { preloadWhenIdle } from "@/lib/useMotionAllowed";
import ScrollReveal from "./rb/ScrollReveal";
import VariableProximity from "./rb/VariableProximity";
import Reveal from "./Reveal";
import { useSiteState } from "./SiteState";

const loadMenu = () => import("./rb/FlowingMenu");

/** Plain list of the same links: shown while the animated menu downloads and when JavaScript is off. */
function ContactList() {
  return (
    <ul className="contact-list">
      {site.contact.rows.map((row) => {
        const external = /^https?:/.test(row.href);
        return (
          <li key={row.label}>
            <a href={row.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
              {row.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

const FlowingMenu = dynamic(loadMenu, { ssr: false, loading: () => <ContactList /> });

const BANDS = {
  blue: { bandColor: ACCENT_STRONG, bandText: "#ffffff" },
  clear: { bandColor: "transparent", bandText: INK },
};

export default function Contact() {
  const { contact } = site;
  const { contactSeen } = useSiteState();
  const titleBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => preloadWhenIdle(loadMenu), []);

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
        <ScrollReveal baseOpacity={0} enableBlur blurStrength={4} baseRotation={0} containerClassName="intro" textClassName="intro-text">
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
            marqueeBgColor={ACCENT_STRONG}
            marqueeTextColor="#ffffff"
            borderColor={LINE}
            imageShape="circle"
            ariaLabel={contact.menuAriaLabel}
          />
        )}
        <noscript>
          <ContactList />
        </noscript>
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
