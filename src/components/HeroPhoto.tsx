/**
 * HeroPhoto: the hero cutout (the page's LCP image) with its two batch 12 effects.
 *
 * 1. Constellation halo: an inline SVG over the photo box (points in src/lib/heroHalo.ts). Hover (mouse) or the
 *    `is-halo` class fades it in, draws each line (stroke-dashoffset, pathLength 1, staggered) and lets the points
 *    twinkle; the glow brightens. All of that is CSS (sections.css, "Hero halo"). On touch screens ((hover: none))
 *    a tap adds `is-halo` for ~1.7 s, and it plays once by itself after each return of the photo (below).
 *
 * 2. Star dust: an IntersectionObserver on the hero section. Leave (< 30% visible): the photo fades out (250 ms)
 *    while a canvas draws particles sampled from the cutout's alpha (every 4.5 px where alpha > 0.5, capped at
 *    1,500 / 700 below 768 px) that drift up and outward and fade into star colour over 1.2 s; the glow fades with
 *    them. Return (>= 30% visible): the same particles fall back over 1.2 s, then the photo fades in and the glow
 *    returns. One progress value (0 = assembled, 1 = dispersed) runs both ways, so a reversal mid-way is smooth.
 *    Budget: the canvas is created on the first leave (or first return), devicePixelRatio is capped at 2, and rAF
 *    runs only while particles move.
 *
 * LCP: nothing changes on the first page load. The first observer report only records where the hero is; if the
 * page opens scrolled past it, the photo is hidden without animation (it is off screen) and reassembles on return.
 * Reduced motion: no particles and no line drawing; leave and return are a 200 ms fade, hover just fades the halo in.
 * Without JavaScript: the photo is simply there (hover still shows the halo, pure CSS).
 */
"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { HERO_IMAGE, HERO_SIZES } from "@/lib/images";
import { HALO_CHORDS, HALO_POINTS, HALO_TAP_MS } from "@/lib/heroHalo";
import Picture from "./Picture";

const LEAVE_RATIO = 0.3; // the hero counts as "left" below 30% visible
const DUST_MS = 1200; // particle flight, both ways
const PHOTO_FADE_MS = 300; // photo fade-in after the particles land (matches the CSS transition + a frame)
const SAMPLE_STEP = 4.5; // px between alpha samples
const MAX_DESKTOP = 1500;
const MAX_PHONE = 700; // below 768 px
const SHADES = 5; // colour steps from the photo pixel to star colour
const STAR: [number, number, number] = [205, 225, 245]; // SKY_STAR in lib/theme.ts

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const touchOnly = () => window.matchMedia("(hover: none)").matches;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

// Halo geometry in the photo's own pixel space (viewBox = the image size), so it scales with the box exactly.
const VW = HERO_IMAGE.width;
const VH = HERO_IMAGE.height;
const pt = (i: number) => [(HALO_POINTS[i][0] / 100) * VW, (HALO_POINTS[i][1] / 100) * VH] as const;
const HALO_LINES = [
  ...HALO_POINTS.slice(1).map((_, i) => ({ a: i, b: i + 1, chord: false })),
  ...HALO_CHORDS.map(([a, b]) => ({ a, b, chord: true })),
];

/** Decorative constellation over the photo box. --i staggers each line and star; --n reverses the order on leave. */
function Halo() {
  return (
    <svg className="hero-halo" viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true" focusable="false" style={{ "--n": HALO_LINES.length } as CSSProperties}>
      {HALO_LINES.map(({ a, b, chord }, i) => {
        const [x1, y1] = pt(a);
        const [x2, y2] = pt(b);
        return (
          <path
            key={`${a}-${b}`}
            className={chord ? "halo-line halo-chord" : "halo-line"}
            d={`M${x1.toFixed(1)},${y1.toFixed(1)}L${x2.toFixed(1)},${y2.toFixed(1)}`}
            pathLength={1}
            style={{ "--i": i } as CSSProperties}
          />
        );
      })}
      {HALO_POINTS.map((_, i) => {
        const [cx, cy] = pt(i);
        return <circle key={i} className="halo-star" cx={cx.toFixed(1)} cy={cy.toFixed(1)} r="4.5" style={{ "--i": i } as CSSProperties} />;
      })}
    </svg>
  );
}

type Dust = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  boxW: number;
  w: number; // canvas size (CSS px)
  h: number;
  ox: number; // where the photo box's top-left corner is inside the canvas
  oy: number;
  n: number;
  x: Float32Array; // start position in the box
  y: Float32Array;
  dx: Float32Array; // flight at the end of the leave
  dy: Float32Array;
  sway: Float32Array; // sideways bend of the path
  delay: Float32Array; // ms
  dur: Float32Array; // ms
  size: Float32Array;
  colors: string[]; // SHADES per particle: photo colour -> star colour
};

/** Samples the cutout as drawn in the box and prepares the particles; null if the photo is not decoded yet. */
function buildDust(wrap: HTMLElement, img: HTMLImageElement, old: Dust | null): Dust | null {
  const boxW = wrap.clientWidth;
  const boxH = wrap.clientHeight;
  if (!img.complete || !img.naturalWidth || boxW < 10 || boxH < 10) return null;

  const off = document.createElement("canvas");
  off.width = Math.round(boxW);
  off.height = Math.round(boxH);
  const octx = off.getContext("2d", { willReadFrequently: true });
  if (!octx) return null;
  let px: Uint8ClampedArray;
  try {
    octx.drawImage(img, 0, 0, off.width, off.height);
    px = octx.getImageData(0, 0, off.width, off.height).data;
  } catch {
    return null; // e.g. a tainted canvas: then leave/return is a plain fade
  }

  // every SAMPLE_STEP px where alpha > 0.5
  const cand: number[] = [];
  for (let y = SAMPLE_STEP / 2; y < off.height; y += SAMPLE_STEP) {
    for (let x = SAMPLE_STEP / 2; x < off.width; x += SAMPLE_STEP) {
      const i = (Math.floor(y) * off.width + Math.floor(x)) * 4;
      if (px[i + 3] > 127) cand.push(i);
    }
  }
  // over budget: a random subset (partial Fisher-Yates), so the dust covers the whole figure evenly
  const max = window.innerWidth < 768 ? MAX_PHONE : MAX_DESKTOP;
  const n = Math.min(max, cand.length);
  for (let k = 0; k < n; k++) {
    const j = k + Math.floor(Math.random() * (cand.length - k));
    [cand[k], cand[j]] = [cand[j], cand[k]];
  }

  // room for the flight: up to 55% of the box above it and 35% of its width on either side
  const padX = Math.round(boxW * 0.35);
  const padTop = Math.round(boxH * 0.55);
  const w = Math.round(boxW + 2 * padX);
  const h = Math.round(boxH + padTop + 8);
  const canvas = old?.canvas ?? document.createElement("canvas");
  if (!old) {
    canvas.className = "hero-dust";
    canvas.setAttribute("aria-hidden", "true");
    wrap.appendChild(canvas);
  }
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  Object.assign(canvas.style, { left: `${-padX}px`, top: `${-padTop}px`, width: `${w}px`, height: `${h}px` });
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const d: Dust = {
    canvas, ctx, boxW, w, h, ox: padX, oy: padTop, n,
    x: new Float32Array(n), y: new Float32Array(n), dx: new Float32Array(n), dy: new Float32Array(n),
    sway: new Float32Array(n), delay: new Float32Array(n), dur: new Float32Array(n), size: new Float32Array(n),
    colors: new Array(n * SHADES),
  };
  const big = window.innerWidth >= 768;
  for (let k = 0; k < n; k++) {
    const i = cand[k];
    const pxIndex = i / 4;
    const x = pxIndex % off.width;
    const y = Math.floor(pxIndex / off.width);
    const nx = (x - boxW / 2) / (boxW / 2); // -1 left .. 1 right: drift outward
    const top = 1 - y / boxH; // 1 at the head: the head goes first and rises furthest
    d.x[k] = x;
    d.y[k] = y;
    d.dx[k] = nx * padX * rand(0.25, 0.85) + rand(-14, 14);
    d.dy[k] = -padTop * rand(0.3, 0.6 + 0.35 * top);
    d.sway[k] = rand(-18, 18);
    d.delay[k] = top * 220 + rand(0, 140);
    d.dur[k] = DUST_MS - d.delay[k] - rand(0, 140);
    d.size[k] = (big ? 2.2 : 1.8) + rand(-0.4, 0.4);
    for (let s = 0; s < SHADES; s++) {
      const m = (s / (SHADES - 1)) * 0.85; // never quite white: the dust stays a little warm until it fades
      const c = (ch: number) => Math.round(px[i + ch] + (STAR[ch] - px[i + ch]) * m);
      d.colors[k * SHADES + s] = `rgb(${c(0)},${c(1)},${c(2)})`;
    }
  }
  return d;
}

/** Draws every particle at global progress p (0 assembled .. 1 dispersed). */
function drawDust(d: Dust, p: number) {
  const { ctx } = d;
  ctx.clearRect(0, 0, d.w, d.h);
  const t = p * DUST_MS;
  for (let k = 0; k < d.n; k++) {
    const q = Math.min(1, Math.max(0, (t - d.delay[k]) / d.dur[k]));
    if (q >= 1) continue; // fully faded
    const e = q * q; // ease-in on the way out = a soft landing on the way back
    const s = d.size[k] * (1 - 0.35 * q);
    ctx.globalAlpha = 1 - q;
    ctx.fillStyle = d.colors[k * SHADES + Math.min(SHADES - 1, Math.floor(q * SHADES))];
    ctx.fillRect(d.ox + d.x[k] + d.dx[k] * e + d.sway[k] * Math.sin(e * Math.PI) - s / 2, d.oy + d.y[k] + d.dy[k] * e - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
}

/** Leave / return of the hero section -> star dust (or a plain fade under reduced motion). */
function useStarDust(wrapRef: RefObject<HTMLDivElement | null>, playHalo: () => void) {
  useEffect(() => {
    const wrap = wrapRef.current;
    const section = wrap?.closest("section");
    const img = wrap?.querySelector("img");
    if (!wrap || !section || !img || typeof IntersectionObserver === "undefined") return undefined;

    let first = true;
    let away = false; // where the photo is heading
    let p = 0; // progress, 0 = assembled
    let dust: Dust | null = null;
    let raf = 0;
    let last = 0;
    let fadeTimer = 0;

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const landed = () => {
      // particles are home: show the photo, fade the canvas out, then clear it
      wrap.classList.remove("is-dust");
      if (dust) {
        dust.canvas.classList.add("is-fading");
        window.clearTimeout(fadeTimer);
        fadeTimer = window.setTimeout(() => {
          if (!away && dust) dust.ctx.clearRect(0, 0, dust.w, dust.h);
        }, PHOTO_FADE_MS);
      }
      if (touchOnly()) window.setTimeout(playHalo, PHOTO_FADE_MS);
    };
    const tick = (now: number) => {
      p = Math.min(1, Math.max(0, p + ((away ? 1 : -1) * (now - last)) / DUST_MS));
      last = now;
      if (dust) drawDust(dust, p);
      if (!away && p <= 0) {
        stop();
        landed();
      } else if (away && p >= 1) {
        stop(); // all particles have faded: nothing left to draw
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    const run = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    // (re)build the particles when there are none yet, or when the box changed size while at rest
    const ensureDust = () => {
      if (dust && (dust.boxW === wrap.clientWidth || (p > 0 && p < 1))) return dust;
      dust = buildDust(wrap, img, dust) ?? dust;
      return dust;
    };

    const leave = (animate: boolean) => {
      away = true;
      wrap.classList.add("is-dust"); // photo fades out (250 ms), glow fades (1.2 s); the halo hides
      if (!animate || reducedMotion()) {
        stop();
        p = 1;
        if (dust) dust.ctx.clearRect(0, 0, dust.w, dust.h);
        return;
      }
      if (!ensureDust()) return;
      dust!.canvas.classList.remove("is-fading");
      run();
    };
    const back = () => {
      away = false;
      if (reducedMotion() || !ensureDust()) {
        stop();
        p = 0;
        landed();
        return;
      }
      dust!.canvas.classList.remove("is-fading");
      run();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const out = entry.intersectionRatio < LEAVE_RATIO;
        if (first) {
          first = false;
          if (out) leave(false); // opened below the hero: hide quietly, reassemble on return
          return;
        }
        if (out !== away) {
          if (out) leave(true);
          else back();
        }
      },
      { threshold: [LEAVE_RATIO] },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      stop();
      window.clearTimeout(fadeTimer);
      wrap.classList.remove("is-dust");
      dust?.canvas.remove();
    };
  }, [wrapRef, playHalo]);
}

export default function HeroPhoto({ alt }: { alt: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const haloTimer = useRef(0);
  // Touch screens: show the halo for HALO_TAP_MS (the `is-halo` class runs the same CSS as a mouse hover).
  const playHalo = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    wrap.classList.add("is-halo");
    window.clearTimeout(haloTimer.current);
    haloTimer.current = window.setTimeout(() => wrap.classList.remove("is-halo"), HALO_TAP_MS);
  }, []);

  useStarDust(wrapRef, playHalo);

  // A tap on the photo (touch only; a scroll gesture ends in pointercancel, not pointerup).
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const onUp = (e: PointerEvent) => {
      if (e.pointerType === "touch" && touchOnly() && !wrap.classList.contains("is-dust")) playHalo();
    };
    wrap.addEventListener("pointerup", onUp);
    return () => {
      wrap.removeEventListener("pointerup", onUp);
      window.clearTimeout(haloTimer.current);
    };
  }, [playHalo]);

  return (
    <div className="hero-photo-wrap" ref={wrapRef}>
      <Picture className="hero-photo" image={HERO_IMAGE} alt={alt} sizes={HERO_SIZES} priority />
      <Halo />
    </div>
  );
}
