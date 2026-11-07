/**
 * AboutConstellation: the About topic navigation drawn as a small constellation (four stars in an uneven zig-zag,
 * joined by three straight lines), replacing the dots (batch 8, ADR 0015).
 * Why: it reads as part of the night sky. Line colour / opacity / width and the star colour and size are the
 * starfield's own constants (lib/theme.ts SKY_*), so it matches the canvas behind it.
 *
 * Each star is a real <button> (a 24px+ hit area holding the star and its short label), labelled
 * "Show topic N of 4: Title", with `aria-current` on the active one, in a group named "About topics". The lines are
 * decorative SVG (`aria-hidden`). Stars twinkle with CSS opacity at staggered timings (off under reduced motion);
 * the active star is bigger, fully bright, with a faint accent glow, and its label turns ink colour.
 */
import type { CSSProperties } from "react";
import { SKY_BRIGHT_ALPHA, SKY_BRIGHT_R, SKY_LINK, SKY_LINK_ALPHA, SKY_LINK_WIDTH, SKY_STAR, SKY_TWINKLE_MIN } from "@/lib/theme";

// Geometry (px): one column per star; the stars' heights make the uneven zig-zag.
const COL = 64; // column width = each button's width
const STAR_Y = [10, 26, 6, 20]; // star centre, from the top of the drawing
const HEIGHT = 56; // drawing height: the lowest star (26) + half its 24px star box + its label below

type Props = {
  titles: string[];
  labels: string[];
  active: number;
  groupLabel: string;
  dotLabel: (n: number, total: number, title: string) => string;
  onSelect: (index: number) => void;
};

export default function AboutConstellation({ titles, labels, active, groupLabel, dotLabel, onSelect }: Props) {
  const n = titles.length;
  const width = COL * n;
  const cx = (i: number) => COL * i + COL / 2;
  const cy = (i: number) => STAR_Y[i % STAR_Y.length];
  // Shared sky values as CSS variables (the star size is the bright stars' largest radius).
  const vars = {
    "--sky-star": SKY_STAR,
    "--sky-star-alpha": SKY_BRIGHT_ALPHA,
    "--sky-star-size": `${SKY_BRIGHT_R[1] * 2}px`,
    "--sky-twinkle-min": SKY_TWINKLE_MIN,
    width,
    height: HEIGHT,
  } as CSSProperties;

  return (
    <div className="about-sky" role="group" aria-label={groupLabel} style={vars}>
      <svg className="about-sky-lines" width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} aria-hidden="true" focusable="false">
        {titles.slice(1).map((t, i) => (
          <line
            key={t}
            x1={cx(i)}
            y1={cy(i)}
            x2={cx(i + 1)}
            y2={cy(i + 1)}
            stroke={SKY_LINK}
            strokeOpacity={SKY_LINK_ALPHA}
            strokeWidth={SKY_LINK_WIDTH}
          />
        ))}
      </svg>
      {titles.map((t, i) => (
        <button
          key={t}
          type="button"
          className={`about-star${i === active ? " is-active" : ""}`}
          style={{ left: COL * i, top: cy(i) - 12 /* the 24px star box is centred on the star */, width: COL, "--twinkle-delay": `${-i * 0.9}s`, "--twinkle-time": `${2.8 + (i % 2) * 0.7}s` } as CSSProperties}
          aria-label={dotLabel(i + 1, n, t)}
          aria-current={i === active ? "true" : undefined}
          onClick={() => onSelect(i)}
        >
          <span className="about-star-point" aria-hidden="true" />
          <span className="about-star-label" aria-hidden="true">
            {labels[i]}
          </span>
        </button>
      ))}
    </div>
  );
}
