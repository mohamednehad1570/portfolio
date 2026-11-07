/**
 * ContactRings: the five contact links as rotating text rings in one line (D17 revised, ADR 0006).
 * Why: replaces the FlowingMenu bands. No rows, backgrounds or names: the stars show through; each ring is one
 * link whose accessible name is its `aria-label` (the ring text is decorative, so it is hidden from assistive tech);
 * links that open a new tab say so in that label (newTabLabel).
 *  - neighbouring rings spin in opposite directions (even positions clockwise, odd counter-clockwise) and
 *    alternate ink / accent text colour;
 *  - the service logo in the centre turns against its ring (`centerSpin="opposite"`: same speed, opposite way);
 *  - hover speeds the spin up and tilts the ring; reduced motion: no spin, no tilt, logos upright (CircularText);
 *  - the rings fade up one after another, 120 ms apart, when the row enters the viewport (CSS, `--i` = position).
 * Sizes come from CSS variables (sections.css): 184px desktop, ~140px tablet, 104px phone in a 3 + 2 wrap.
 * Logos are shown white and unmodified (trademarks of their owners; see ADR 0006 on rotating logos).
 */
"use client";

import { useRef, type ComponentType, type CSSProperties } from "react";
import { site, type ContactRing } from "@/content/site";
import { ACCENT, INK } from "@/lib/theme";
import { newTabLabel, newTabProps } from "@/lib/links";
import { useEnterOnce } from "@/lib/useEnterOnce";
import CalendarIcon from "../icons/CalendarIcon";
import EnvelopeOpenIcon from "../icons/EnvelopeOpenIcon";
import GitHubIcon from "../icons/GitHubIcon";
import LinkedInIcon from "../icons/LinkedInIcon";
import WhatsAppIcon from "../icons/WhatsAppIcon";
import CircularText from "../rb/CircularText";

const LOGOS: Record<ContactRing["id"], ComponentType> = {
  email: EnvelopeOpenIcon,
  whatsapp: WhatsAppIcon,
  linkedin: LinkedInIcon,
  github: GitHubIcon,
  booking: CalendarIcon,
};

export default function ContactRings() {
  const rowRef = useRef<HTMLDivElement>(null);
  useEnterOnce(rowRef, 0.2);

  return (
    <div ref={rowRef} className="rings">
      {site.contact.rings.map((ring, i) => {
        const Logo = LOGOS[ring.id];
        return (
          <div key={ring.id} className="ring-item" style={{ "--i": i } as CSSProperties}>
            <a className="ring-link" href={ring.href} aria-label={newTabLabel(ring.label, ring.href)} {...newTabProps(ring.href)}>
              <CircularText
                text={ring.ringText}
                className="ring-text"
                size={184}
                fontSize={15.5}
                fontWeight={800}
                fill
                spinDuration={20}
                direction={i % 2 === 0 ? "clockwise" : "counterclockwise"}
                onHover="speedUp"
                hoverTilt={20}
                draggable={false}
                color={i % 2 === 0 ? INK : ACCENT}
                centerSpin="opposite"
                decorative
              >
                <span className="ring-logo">
                  <Logo />
                </span>
              </CircularText>
            </a>
          </div>
        );
      })}
    </div>
  );
}
