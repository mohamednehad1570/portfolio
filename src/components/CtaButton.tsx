/**
 * CtaButton: the site's main button. A link (<a>) styled with React Bits StarBorder (dark face, accent light),
 * pulled toward the pointer by Magnet and with a spark burst on click (ClickSpark).
 * Why: one shared component so every call-to-action looks and behaves the same. Dark theme (ADR 0004):
 * only the colours changed, not the behaviour.
 */
"use client";

import type { ReactNode } from "react";
import Magnet from "./rb/Magnet";
import ClickSpark from "./rb/ClickSpark";
import StarBorder from "./rb/StarBorder";
import { ACCENT, SURFACE } from "@/lib/theme";

export default function CtaButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Magnet padding={60} magnetStrength={4} wrapperClassName="btn-magnet">
      <ClickSpark sparkColor={ACCENT} sparkCount={10} sparkRadius={28} sparkSize={12} style={{ display: "inline-block" }}>
        <StarBorder as="a" href={href} theme="dark" backgroundColor={SURFACE} color={ACCENT} trailColor={ACCENT} radius={26} glow={0.5} thickness={1.2} className="cta">
          {children}
        </StarBorder>
      </ClickSpark>
    </Magnet>
  );
}
