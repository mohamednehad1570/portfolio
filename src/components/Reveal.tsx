/**
 * Reveal: fades and slides its children in once, the first time they enter the screen.
 * Why: used for photos, cards and small text blocks. Adds a CSS class directly on the element (no React
 * state, so no re-render). Reduced-motion visitors see the content at once (see the rules in sections.css).
 */
"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  from?: "up" | "left" | "right";
  delay?: number; // ms
  className?: string;
  children: ReactNode;
};

export default function Reveal({ from = "up", delay = 0, className = "", children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect(); // enter-once
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal reveal--${from} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
