/**
 * StarfieldBackground: the fixed full-screen night sky behind the whole page ("A3 Constellation night", ADR 0002).
 *
 * Why it exists: it is the site's one signature visual. It is decorative only (aria-hidden, no pointer events),
 * so it must never block text, clicks or loading. Canvas 2D: no WebGL needed, cheap on any device.
 *
 * What is drawn (numbers come from the approved sample):
 *  - twinkling stars, about 1 per 3000 px² of screen (capped), a few of them bright;
 *  - fixed constellations: about 45 stars joined to their nearest neighbour by a faint line;
 *  - cursor links: stars near the pointer join each other (a tap does the same on touch screens and fades out);
 *  - shooting stars (meteor streaks) every 2.5 to 3.5 seconds, heading towards the bottom-left.
 *
 * Rules it follows: the loop stops when the tab is hidden; under `prefers-reduced-motion: reduce` it draws ONE
 * static frame (stars + fixed links, no twinkle, no meteors, no cursor links); if the canvas cannot be created
 * the plain page background (#0a1626, set on <body>) simply shows.
 */
"use client";

import { useEffect, useRef } from "react";
import { BG, SKY_BRIGHT_ALPHA, SKY_BRIGHT_R, SKY_LINK, SKY_LINK_ALPHA, SKY_LINK_WIDTH, SKY_STAR, SKY_TWINKLE_MIN } from "@/lib/theme";

// ---- Tuning (from the approved sample) ----
const AREA_PER_STAR = 3000; // px² of screen per star
const MAX_STARS_DESKTOP = 450;
const MAX_STARS_MOBILE = 160;
const MOBILE_MAX_WIDTH = 760; // same phone breakpoint as sections.css
const SMALL_SCREEN_WIDTH = 500; // meteors are slower and shorter below this width
const BRIGHT_SHARE = 0.07;
const STAR_RGB = SKY_STAR; // shared with the About constellation (lib/theme.ts)
const LINK_RGB = SKY_LINK;
const CONSTELLATION_STARS = 45;
const CONSTELLATION_MIN = 30; // px: closer neighbours are ignored (they would overlap)
const CONSTELLATION_MAX = 150;
const CONSTELLATION_ALPHA = SKY_LINK_ALPHA;
const LINK_WIDTH = SKY_LINK_WIDTH;
const CURSOR_REACH = 160; // stars within this distance of the pointer may link
const CURSOR_LINK_MAX = 90; // ...when they are closer than this to each other
const CURSOR_LINK_ALPHA = 0.4;
const TAP_FADE_SECONDS = 1.2;
const METEOR_GAP_SECONDS: [number, number] = [2.5, 3.5];
const MAX_PIXEL_RATIO = 2; // cap the canvas resolution so 3x phones do not draw 9x the pixels
const RESIZE_DEBOUNCE_MS = 150;

type Star = { nx: number; ny: number; r: number; alpha: number; speed: number; phase: number };
type Meteor = { x: number; y: number; vx: number; vy: number; tail: number; life: number; age: number };
type Touch = { x: number; y: number; age: number }; // a tap, age in seconds

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return undefined; // no canvas: the plain navy page stays

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = motionQuery.matches;

    // Layout state. Stars are stored as fractions of the screen (0..1), so a small resize never makes them jump.
    let W = 0, H = 0, D = 1;
    let stars: Star[] = [];
    let px = new Float32Array(0), py = new Float32Array(0); // star positions in CSS pixels
    let chosen: number[] = []; // indexes of the stars that start a constellation line
    let links: [number, number, number, number][] = []; // fixed constellation lines (x1, y1, x2, y2)

    // Animation state
    let raf = 0, last = 0, clock = 0, alive = true;
    let nextMeteor = rand(...METEOR_GAP_SECONDS);
    const meteors: Meteor[] = [];
    const taps: Touch[] = [];
    const pointer = { x: 0, y: 0, active: false };
    const near: number[] = []; // scratch list reused every frame (no allocation in the loop)

    const makeStars = (count: number) => {
      stars = Array.from({ length: count }, () => {
        const bright = Math.random() < BRIGHT_SHARE;
        return {
          nx: Math.random(),
          ny: Math.random(),
          r: bright ? rand(...SKY_BRIGHT_R) : rand(0.4, 1.15),
          alpha: bright ? SKY_BRIGHT_ALPHA : rand(0.3, 0.8),
          speed: rand(0.5, 2.3), // twinkle speed, rad/s
          phase: rand(0, Math.PI * 2),
        };
      });
      // pick which stars start a constellation (shuffle, take the first few)
      chosen = Array.from({ length: count }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, CONSTELLATION_STARS);
    };

    // Pixel positions + the fixed constellation lines; redone whenever the screen size changes.
    const layout = () => {
      px = new Float32Array(stars.length);
      py = new Float32Array(stars.length);
      stars.forEach((s, i) => {
        px[i] = s.nx * W;
        py[i] = s.ny * H;
      });
      links = [];
      for (const i of chosen) {
        let best = -1, bestD = Infinity;
        for (let j = 0; j < stars.length; j++) {
          if (j === i) continue;
          const d = Math.hypot(px[j] - px[i], py[j] - py[i]);
          if (d >= CONSTELLATION_MIN && d <= CONSTELLATION_MAX && d < bestD) {
            best = j;
            bestD = d;
          }
        }
        if (best >= 0) links.push([px[i], py[i], px[best], py[best]]);
      }
    };

    const targetCount = () =>
      Math.min(W < MOBILE_MAX_WIDTH ? MAX_STARS_MOBILE : MAX_STARS_DESKTOP, Math.round((W * H) / AREA_PER_STAR));

    // Size the canvas to the screen (this clears it, so callers draw right after).
    const fit = () => {
      const w = Math.max(1, cv.clientWidth), h = Math.max(1, cv.clientHeight);
      const d = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
      if (w === W && h === H && d === D) return false;
      W = w; H = h; D = d;
      cv.width = Math.round(W * D);
      cv.height = Math.round(H * D);
      ctx.setTransform(D, 0, 0, D, 0, 0); // draw in CSS pixels
      return true;
    };

    // ---- Drawing ----
    // Links between the stars close to (x, y); `k` (0..1) scales their opacity (1 for the cursor, fading for taps).
    const linkAround = (x: number, y: number, k: number) => {
      near.length = 0;
      for (let i = 0; i < stars.length; i++) {
        const dx = px[i] - x, dy = py[i] - y;
        if (dx * dx + dy * dy < CURSOR_REACH * CURSOR_REACH) near.push(i);
      }
      ctx.lineWidth = LINK_WIDTH;
      ctx.strokeStyle = LINK_RGB;
      for (let a = 0; a < near.length; a++) {
        for (let b = a + 1; b < near.length; b++) {
          const i = near[a], j = near[b];
          const d = Math.hypot(px[i] - px[j], py[i] - py[j]);
          if (d >= CURSOR_LINK_MAX) continue;
          ctx.globalAlpha = CURSOR_LINK_ALPHA * (1 - d / CURSOR_LINK_MAX) * k;
          ctx.beginPath();
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(px[j], py[j]);
          ctx.stroke();
        }
      }
    };

    const drawMeteor = (m: Meteor) => {
      // fade in over ~8 frames, out over the last ~20 (age and life are counted in 60 fps frames)
      const alpha = Math.min(1, m.age / 8) * Math.min(1, (m.life - m.age) / 20);
      if (alpha <= 0) return;
      const len = Math.hypot(m.vx, m.vy);
      const tx = m.x - (m.vx / len) * m.tail, ty = m.y - (m.vy / len) * m.tail;
      const g = ctx.createLinearGradient(m.x, m.y, tx, ty); // head (bright) to tail (transparent)
      g.addColorStop(0, "rgba(120,180,230,0.95)");
      g.addColorStop(1, "rgba(120,180,230,0)");
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    };

    const spawnMeteor = () => {
      const small = W < SMALL_SCREEN_WIDTH;
      // direction 198° to 218° in maths convention (y up) = towards the bottom-left of the screen
      const angle = (rand(198, 218) * Math.PI) / 180;
      const speed = small ? rand(7, 12) : rand(10, 15); // px per frame at 60 fps
      meteors.push({
        x: rand(0.35, 1.05) * W,
        y: rand(-0.05, 0.35) * H,
        vx: Math.cos(angle) * speed,
        vy: -Math.sin(angle) * speed, // canvas y points down
        tail: small ? rand(80, 140) : rand(120, 220),
        life: rand(55, 85),
        age: 0,
      });
    };

    // One frame. `animated` false = the reduced-motion still: no twinkle, no meteors, no cursor links.
    const draw = (animated: boolean) => {
      ctx.globalAlpha = 1;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // stars
      ctx.fillStyle = STAR_RGB;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = animated ? SKY_TWINKLE_MIN + (1 - SKY_TWINKLE_MIN) * Math.sin(clock * s.speed + s.phase) : 1;
        ctx.globalAlpha = s.alpha * twinkle;
        ctx.beginPath();
        ctx.arc(px[i], py[i], s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // fixed constellations (one path, one stroke)
      ctx.globalAlpha = CONSTELLATION_ALPHA;
      ctx.strokeStyle = LINK_RGB;
      ctx.lineWidth = LINK_WIDTH;
      ctx.beginPath();
      for (const [x1, y1, x2, y2] of links) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();

      if (animated) {
        if (pointer.active) linkAround(pointer.x, pointer.y, 1);
        for (const t of taps) linkAround(t.x, t.y, 1 - t.age / TAP_FADE_SECONDS);
        for (const m of meteors) drawMeteor(m);
      }
      ctx.globalAlpha = 1;
    };

    // Advance the simulation by dt seconds (dt is capped, so a long pause never makes meteors jump).
    const step = (dt: number) => {
      clock += dt;
      const frames = dt * 60; // frame-rate independent: speeds are "per frame at 60 fps"
      nextMeteor -= dt;
      if (nextMeteor <= 0) {
        spawnMeteor();
        nextMeteor = rand(...METEOR_GAP_SECONDS);
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.age += frames;
        m.x += m.vx * frames;
        m.y += m.vy * frames;
        if (m.age >= m.life) meteors.splice(i, 1);
      }
      for (let i = taps.length - 1; i >= 0; i--) {
        taps[i].age += dt;
        if (taps[i].age >= TAP_FADE_SECONDS) taps.splice(i, 1);
      }
    };

    const frame = (now: number) => {
      raf = 0;
      if (!alive || document.hidden || reduce) { last = 0; return; } // hidden tab or reduced motion: stop
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      step(dt);
      draw(true);
      raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (!raf && alive && !document.hidden && !reduce) raf = requestAnimationFrame(frame);
    };

    // ---- Setup and events ----
    const rebuild = () => {
      fit();
      const count = targetCount();
      if (count !== stars.length) makeStars(count);
      layout();
      draw(!reduce);
    };
    rebuild();
    wake();

    // On resize: refit right away (no blank flash), rebuild stars and lines once the resizing stops.
    let resizeTimer = 0;
    const onResize = () => {
      if (fit()) {
        layout();
        draw(!reduce);
      }
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(rebuild, RESIZE_DEBOUNCE_MS);
    };

    // Mouse / pen move the links with the pointer; touch uses taps (a scroll gesture is not a tap).
    const onMove = (e: PointerEvent) => {
      if (reduce || e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => { pointer.active = false; };
    let down: { x: number; y: number; t: number } | null = null;
    const onDown = (e: PointerEvent) => {
      down = e.pointerType === "touch" ? { x: e.clientX, y: e.clientY, t: performance.now() } : null;
    };
    const onUp = (e: PointerEvent) => {
      if (reduce || !down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      if (moved < 10 && performance.now() - down.t < 500) {
        taps.push({ x: e.clientX, y: e.clientY, age: 0 });
        if (taps.length > 4) taps.shift();
        wake();
      }
      down = null;
    };
    const onVisibility = () => { last = 0; wake(); };
    const onMotionChange = () => {
      reduce = motionQuery.matches;
      if (reduce) {
        meteors.length = 0;
        taps.length = 0;
        pointer.active = false;
      }
      draw(!reduce);
      wake();
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  // Inline styles keep the canvas out of the layout flow (no layout shift) even before any CSS loads.
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
    />
  );
}
