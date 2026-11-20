/**
 * BrowserFrame and TerminalFrame: the window frame of a project card (light browser window / dark terminal).
 * Why (D16): both cards get a frame of the same size, and both are wrapped in GlareHover.
 * Batch 12: the frames show real content passed as children (the scrolling site screenshot, the scaling chart), so
 * they are plain boxes, not links and not role="img": the content names itself (the screenshot's alt, the chart's
 * aria-label). The address bar is decoration and hidden from screen readers.
 * Equal height: on two-column layouts each frame fills its grid row (height 100% down the chain, see .frame in
 * sections.css), so the shorter frame stretches to match the taller one instead of leaving a gap under it.
 * Dark theme (ADR 0004): the browser frame stays light (a light window reads clearly on navy); the terminal frame
 * is dark and gets a `line` border so its edge separates from the night-sky background.
 */
import type { ReactNode } from "react";
import GlareHover from "./rb/GlareHover";
import { LINE } from "@/lib/theme";

type FrameProps = {
  address: string;
  children: ReactNode;
};

// The three round dots and address pill that make it look like a window (decorative)
function Bar({ address }: { address: string }) {
  return (
    <span className="frame-bar" aria-hidden="true">
      <i />
      <i />
      <i />
      <span className="frame-addr">{address}</span>
    </span>
  );
}

export function BrowserFrame({ address, children }: FrameProps) {
  return (
    <GlareHover
      width="100%"
      height="100%"
      background="#ffffff"
      borderRadius="18px"
      borderColor="#e2e6eb"
      glareColor="#ffffff"
      glareOpacity={0.55}
      blendMode="normal"
      className="frame-glare"
    >
      <div className="frame">
        <Bar address={address} />
        {children}
      </div>
    </GlareHover>
  );
}

export function TerminalFrame({ address, children }: FrameProps) {
  return (
    <GlareHover
      width="100%"
      height="100%"
      background="#0f1216"
      borderRadius="18px"
      borderColor={LINE}
      glareColor="#ffffff"
      glareOpacity={0.35}
      className="frame-glare"
    >
      <div className="frame frame--dark">
        <Bar address={address} />
        {children}
      </div>
    </GlareHover>
  );
}
