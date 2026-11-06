/**
 * Reveal: fades and slides its children in once, the first time they enter the screen.
 * Why: used for photos, cards and body paragraphs. `from="fade"` is the site's block fade-up for body text
 * (opacity, 6px blur and 16px rise, ADR 0005); left/right slide the project frames in. The "before" look is
 * applied by CSS only under the `js` class and never for reduced motion (rule 8, see sections.css), so
 * without JavaScript the content is simply visible.
 */
"use client";

import { useRef, type ReactNode } from "react";
import { useEnterOnce } from "@/lib/useEnterOnce";

type Props = {
  from?: "up" | "left" | "right" | "fade";
  delay?: number; // ms
  className?: string;
  children: ReactNode;
};

export default function Reveal({ from = "up", delay = 0, className = "", children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEnterOnce(ref, 0.2);

  return (
    <div ref={ref} className={`reveal reveal--${from} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
