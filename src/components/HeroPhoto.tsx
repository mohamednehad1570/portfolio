/**
 * HeroPhoto: the hero cutout (the page's LCP image) with its two batch 13 effects. Kept from earlier batches: the
 * baked edge fade and cool grade (in the files), the CSS moonlight glow behind the photo, the starfield.
 *
 * 1. Dawn: two decorative layers behind the cutout, above the moonlight glow: a violet tint over the photo box and
 *    a warm "sun" that rises from below (10% wider than the box on each side). The `is-dawn` class turns it on;
 *    the transitions (and the slight warm-up of the photo) are CSS (sections.css, "Hero Dawn"). Triggers: mouse
 *    over the photo on hover screens; a tap plays it for 3 s on touch screens; and on every size it plays once for
 *    2.6 s each time the photo has fully rebuilt after being more than half dissolved. Never on page load, and the
 *    photo is not a tab stop (Dawn is decoration only).
 *
 * 2. Star dust, scroll-linked: progress p = how far the hero has scrolled up past the viewport top, divided by
 *    (photo top in the hero + 90% of the photo height), clamped 0..1. edge = p * 1.25 - 0.1 is the dissolve front
 *    (0 = top of the photo, 1 = bottom). Above the front the photo is masked away (CSS mask via --edge) and a canvas
 *    draws its points (src/data/hero-particles.json, sampled at build time by scripts/images.mjs: no pixel reads in
 *    the browser) drifting up and fading into star colour. Nothing is timed: it holds when scrolling stops and runs
 *    backwards when scrolling back.
 *    Budget: scroll is read in a passive listener and drawn at most once per animation frame, only while the hero is
 *    near the viewport (IntersectionObserver) and only when p changed; at p = 0 and p = 1 the canvas is empty and
 *    no frame is requested. The canvas and the point data are created on the first scroll into the dissolve
 *    (devicePixelRatio capped at 2); 1,500 points on desktop, 700 below 768 px (thinned evenly).
 *
 * LCP: at p = 0 (the normal first view) nothing is added: no mask, no canvas, no Dawn.
 * Reduced motion: no particles and no mask; the photo just fades (opacity 1 - p); Dawn only fades (no rise).
 * Without JavaScript: the photo is simply there.
 */
"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { HERO_IMAGE, HERO_SIZES } from "@/lib/images";
import Picture from "./Picture";

const DAWN_TAP_MS = 3000; // a tap on a touch screen
const DAWN_REBUILD_MS = 2600; // after the photo rebuilds
const MAX_DESKTOP = 1500; // the JSON already holds at most this many
const MAX_PHONE = 700; // below 768 px
const STAR = "#e3efff"; // dust colour once a point has left the photo
// Room around the photo box for the drift: up to 280 * 0.55 = 154 px up, 80 * 0.35 = 28 px (+ jitter) sideways.
const PAD_X = 40;
const PAD_TOP = 160;
const PAD_BOTTOM = 8;

type Points = { points: [number, number, number, number, number][] };

type Dust = {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cap: number; // MAX_DESKTOP or MAX_PHONE: the set is rebuilt if a resize crosses 768 px
  dpr: number;
  w: number; // photo box (CSS px)
  h: number;
  n: number;
  ux: Float32Array; // point in the box, 0..1
  uy: Float32Array;
  jx: Float32Array; // jitter, -1..1 (scaled to the box on every resize)
  jy: Float32Array;
  vx: Float32Array; // drift, px
  vy: Float32Array;
  size: Float32Array;
  color: string[];
  x: Float32Array; // mapped position in the box (CSS px), set once per resize
  y: Float32Array;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (t: number) => t * t * (3 - 2 * t);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const phoneCap = () => (window.innerWidth < 768 ? MAX_PHONE : MAX_DESKTOP);

/** The point set for one cap: evenly spaced entries of the build-time list, each with its own drift and size. */
function buildDust(data: Points, cap: number, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Dust {
  const all = data.points;
  const n = Math.min(cap, all.length);
  const f = () => new Float32Array(n);
  const d: Dust = {
    canvas, ctx, cap, dpr: 1, w: 0, h: 0, n,
    ux: f(), uy: f(), jx: f(), jy: f(), vx: f(), vy: f(), size: f(), color: new Array(n), x: f(), y: f(),
  };
  for (let k = 0; k < n; k++) {
    const [x, y, r, g, b] = all[Math.floor((k * all.length) / n)];
    d.ux[k] = x / 1000;
    d.uy[k] = y / 1000;
    d.jx[k] = rand(-1, 1);
    d.jy[k] = rand(-1, 1);
    d.vx[k] = rand(-80, 80);
    d.vy[k] = rand(-280, -60);
    d.size[k] = rand(0.9, 1.8);
    d.color[k] = `rgb(${r},${g},${b})`;
  }
  return d;
}

/** Sizes the canvas to the photo box (plus room for the drift) and maps every point into it, with its jitter. */
function layoutDust(d: Dust, w: number, h: number) {
  d.w = w;
  d.h = h;
  d.dpr = Math.min(2, window.devicePixelRatio || 1);
  const cw = w + 2 * PAD_X;
  const ch = h + PAD_TOP + PAD_BOTTOM;
  d.canvas.width = Math.round(cw * d.dpr);
  d.canvas.height = Math.round(ch * d.dpr);
  Object.assign(d.canvas.style, { left: `${-PAD_X}px`, top: `${-PAD_TOP}px`, width: `${cw}px`, height: `${ch}px` });
  for (let k = 0; k < d.n; k++) {
    d.x[k] = d.ux[k] * w + d.jx[k] * w * 0.0083;
    d.y[k] = d.uy[k] * h + d.jy[k] * h * 0.0065;
  }
}

/** One frame. The whole canvas is wiped in device pixels first, so no stale particle can survive a fast scroll. */
function drawDust(d: Dust, edge: number | null) {
  const { ctx, canvas } = d;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (edge === null) return;
  ctx.setTransform(d.dpr, 0, 0, d.dpr, 0, 0);
  let fill = "";
  for (let i = 0; i < d.n; i++) {
    // k: how far past the front this point is (0 = just reached, 1 = gone)
    const k = (edge - d.y[i] / d.h) / 0.45;
    if (k <= 0 || k >= 1) continue;
    const e = smoothstep(k);
    const c = k < 0.2 ? d.color[i] : STAR;
    if (c !== fill) ctx.fillStyle = fill = c;
    ctx.globalAlpha = 1 - e;
    const s = d.size[i];
    ctx.fillRect(PAD_X + d.x[i] + d.vx[i] * 0.35 * e - s / 2, PAD_TOP + d.y[i] + d.vy[i] * 0.55 * e - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
}

/** Dawn on/off: on while hovered, or for a while after `play(ms)`. Returns `play`. */
function useDawn(wrapRef: RefObject<HTMLDivElement | null>) {
  const timer = useRef(0);
  const hovering = useRef(false);
  const sync = useCallback(() => {
    wrapRef.current?.classList.toggle("is-dawn", hovering.current || timer.current !== 0);
  }, [wrapRef]);
  const play = useCallback(
    (ms: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        timer.current = 0;
        sync();
      }, ms);
      sync();
    },
    [sync],
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const canHover = window.matchMedia("(hover: hover)");
    const touchOnly = window.matchMedia("(hover: none)");
    const enter = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !canHover.matches) return;
      hovering.current = true;
      sync();
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      hovering.current = false;
      sync();
    };
    // a tap (a scroll gesture ends in pointercancel, not pointerup)
    const up = (e: PointerEvent) => {
      if (e.pointerType === "touch" && touchOnly.matches) play(DAWN_TAP_MS);
    };
    wrap.addEventListener("pointerenter", enter);
    wrap.addEventListener("pointerleave", leave);
    wrap.addEventListener("pointerup", up);
    return () => {
      wrap.removeEventListener("pointerenter", enter);
      wrap.removeEventListener("pointerleave", leave);
      wrap.removeEventListener("pointerup", up);
      window.clearTimeout(timer.current);
    };
  }, [wrapRef, sync, play]);

  return play;
}

/** Scroll position -> mask + particles (or a plain fade under reduced motion). */
function useScrollDust(wrapRef: RefObject<HTMLDivElement | null>, playDawn: (ms: number) => void) {
  useEffect(() => {
    const wrap = wrapRef.current;
    const section = wrap?.closest("section");
    if (!wrap || !section) return undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    // geometry, re-measured on resize: the hero's top in the document and the scroll distance for p = 1
    let heroTop = 0;
    let span = 1;
    let near = true; // the hero is on or near the screen
    let p = -1; // last applied progress (-1 = nothing applied yet)
    let raf = 0;
    let maxEdge = 0; // furthest the front got since the photo was last whole
    let data: Points | null = null;
    let loading = false;
    let dust: Dust | null = null;

    const progress = () => clamp01((window.scrollY - heroTop) / span);

    const ensureDust = () => {
      if (dust) return dust;
      if (!data) {
        if (!loading) {
          loading = true;
          // a separate chunk, fetched on the first scroll into the dissolve: nothing extra on page load
          import("@/data/hero-particles.json").then((m) => {
            data = m.default as unknown as Points;
            redraw();
          });
        }
        return null;
      }
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      canvas.className = "hero-dust";
      canvas.setAttribute("aria-hidden", "true");
      wrap.appendChild(canvas);
      dust = buildDust(data, phoneCap(), canvas, ctx);
      layoutDust(dust, wrap.clientWidth, wrap.clientHeight);
      return dust;
    };

    const apply = (next: number) => {
      p = next;
      const edge = p * 1.25 - 0.1;
      wrap.classList.toggle("is-dissolving", edge > 0); // Dawn waits while the photo is coming apart
      if (reduced.matches) {
        // plain fade: no mask, no particles
        wrap.classList.remove("is-masked");
        wrap.style.removeProperty("--edge");
        if (p > 0) wrap.style.setProperty("--fade", (1 - p).toFixed(3));
        else wrap.style.removeProperty("--fade");
        if (dust) drawDust(dust, null);
      } else {
        wrap.style.removeProperty("--fade");
        if (p > 0) {
          wrap.style.setProperty("--edge", edge.toFixed(4));
          wrap.classList.add("is-masked");
        } else {
          wrap.classList.remove("is-masked"); // whole photo: no mask at all
          wrap.style.removeProperty("--edge");
        }
        if (p > 0 && p < 1) {
          const d = ensureDust();
          if (d) drawDust(d, edge);
        } else if (dust) {
          drawDust(dust, null); // the ends: empty canvas
        }
      }
      // Dawn once the photo is whole again after being more than half dissolved
      if (edge > maxEdge) maxEdge = edge;
      if (p === 0) {
        if (maxEdge > 0.5) playDawn(DAWN_REBUILD_MS);
        maxEdge = 0;
      }
    };

    const frame = () => {
      raf = 0;
      const next = progress();
      if (next !== p) apply(next); // skip the frame when nothing moved
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    // force the next frame to draw (new geometry, data just arrived)
    const redraw = () => {
      p = -1;
      schedule();
    };
    const onScroll = () => {
      if (near && progress() !== p) schedule();
    };

    const measure = () => {
      const s = section.getBoundingClientRect();
      const b = wrap.getBoundingClientRect();
      heroTop = s.top + window.scrollY;
      span = Math.max(1, b.top - s.top + b.height * 0.9);
      if (dust) {
        if (dust.cap !== phoneCap()) {
          dust = buildDust(data!, phoneCap(), dust.canvas, dust.ctx); // crossed 768 px: other point count
        }
        layoutDust(dust, wrap.clientWidth, wrap.clientHeight);
      }
      redraw();
    };

    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(wrap);
    const io = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        schedule(); // settle once on the way in or out (e.g. a jump to another section)
      },
      { rootMargin: "25% 0px" },
    );
    io.observe(section);
    window.addEventListener("scroll", onScroll, { passive: true });
    reduced.addEventListener("change", redraw);

    return () => {
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      reduced.removeEventListener("change", redraw);
      cancelAnimationFrame(raf);
      wrap.classList.remove("is-masked", "is-dissolving");
      wrap.style.removeProperty("--edge");
      wrap.style.removeProperty("--fade");
      dust?.canvas.remove();
    };
  }, [wrapRef, playDawn]);
}

export default function HeroPhoto({ alt }: { alt: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const playDawn = useDawn(wrapRef);
  useScrollDust(wrapRef, playDawn);

  return (
    <div className="hero-photo-wrap" ref={wrapRef}>
      {/* Dawn (decorative): behind the cutout, above the moonlight glow (::before) */}
      <span className="hero-dawn hero-dawn--tint" aria-hidden="true" />
      <span className="hero-dawn hero-dawn--sun" aria-hidden="true" />
      <Picture className="hero-photo" image={HERO_IMAGE} alt={alt} sizes={HERO_SIZES} priority />
    </div>
  );
}
