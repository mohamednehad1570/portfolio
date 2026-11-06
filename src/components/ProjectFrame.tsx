/**
 * BrowserFrame and TerminalFrame: the picture frame of a project card (light browser window / dark terminal).
 * Why (D16): both cards have the identical 16:10 frame size, and both are wrapped in GlareHover.
 * Until real screenshots exist the frame shows a labelled placeholder (`shot`).
 * Dark theme (ADR 0004): the browser frame stays light (a light window reads clearly on navy; colours are
 * provisional, Mohammed decides after seeing the build); the terminal frame is dark and gets a `line` border so
 * its edge separates from the night-sky background.
 */
import GlareHover from "./rb/GlareHover";
import { LINE } from "@/lib/theme";

type FrameProps = {
  href: string;
  external: boolean;
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

const externalProps = (external: boolean) => (external ? { target: "_blank", rel: "noopener noreferrer" } : {});

export function BrowserFrame({ href, external, ariaLabel, address, shot }: FrameProps) {
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
      <a className="frame" href={href} aria-label={ariaLabel} {...externalProps(external)}>
        <Bar address={address} />
        <span className="frame-shot">{shot}</span>
      </a>
    </GlareHover>
  );
}

export function TerminalFrame({ href, external, ariaLabel, address, shot }: FrameProps) {
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
      <a className="frame frame--dark" href={href} aria-label={ariaLabel} {...externalProps(external)}>
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
      </a>
    </GlareHover>
  );
}
