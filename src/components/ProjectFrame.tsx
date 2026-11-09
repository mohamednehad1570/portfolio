/**
 * BrowserFrame and TerminalFrame: the picture frame of a project card (light browser window / dark terminal).
 * Why (D16): both cards have the identical 16:10 frame size, and both are wrapped in GlareHover.
 * Until real screenshots exist the frame shows a labelled placeholder (`shot`).
 * Without `href` (the client website, batch 10) the frame is a plain labelled box (role="img"), not a link.
 * Dark theme (ADR 0004): the browser frame stays light (a light window reads clearly on navy; colours are
 * provisional, Mohammed decides after seeing the build); the terminal frame is dark and gets a `line` border so
 * its edge separates from the night-sky background.
 */
import GlareHover from "./rb/GlareHover";
import { newTabLabel, newTabProps } from "@/lib/links";
import { LINE } from "@/lib/theme";

type FrameProps = {
  href?: string; // an external URL (opens in a new tab); none = the frame is not a link
  ariaLabel: string;
  address: string;
  shot: string;
};

// The three round dots and address pill that make it look like a window
function Bar({ address }: { address: string }) {
  return (
    <span className="frame-bar">
      <i />
      <i />
      <i />
      <span className="frame-addr">{address}</span>
    </span>
  );
}

// The frame's outer element: a link that opens in a new tab, or (no href) a plain box named by its aria-label.
function FrameBox({ href, ariaLabel, className, children }: { href?: string; ariaLabel: string; className: string; children: React.ReactNode }) {
  if (!href) {
    return (
      <span className={className} role="img" aria-label={ariaLabel}>
        {children}
      </span>
    );
  }
  return (
    <a className={className} href={href} aria-label={newTabLabel(ariaLabel, href)} {...newTabProps(href)}>
      {children}
    </a>
  );
}

export function BrowserFrame({ href, ariaLabel, address, shot }: FrameProps) {
  return (
    <GlareHover
      width="100%"
      height="auto"
      background="#ffffff"
      borderRadius="18px"
      borderColor="#e2e6eb"
      glareColor="#ffffff"
      glareOpacity={0.55}
      blendMode="normal"
      className="frame-glare"
    >
      <FrameBox className="frame" href={href} ariaLabel={ariaLabel}>
        <Bar address={address} />
        <span className="frame-shot">{shot}</span>
      </FrameBox>
    </GlareHover>
  );
}

export function TerminalFrame({ href, ariaLabel, address, shot }: FrameProps) {
  const lines = shot.split("\n");
  return (
    <GlareHover
      width="100%"
      height="auto"
      background="#0f1216"
      borderRadius="18px"
      borderColor={LINE}
      glareColor="#ffffff"
      glareOpacity={0.35}
      className="frame-glare"
    >
      <FrameBox className="frame frame--dark" href={href} ariaLabel={ariaLabel}>
        <Bar address={address} />
        <span className="frame-shot">
          <span className="term-lines">
            {lines.map((line, i) => (
              <span key={i}>
                {line}
                {i < lines.length - 1 ? <br /> : null}
              </span>
            ))}
            <b className="caret" />
          </span>
        </span>
      </FrameBox>
    </GlareHover>
  );
}
