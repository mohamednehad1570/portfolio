/**
 * ScalingChart: the autoscaling card's chart (batch 12). Ready pods (% of full) for a predictive and a reactive load
 * test around the moment traffic arrives, over a faint area of the traffic itself. Inline SVG, no chart library.
 * Data: src/data/scaling-chart.json (30 s grid, read from Grafana screenshots, see its `source`). Copy: site.ts.
 *
 * Drawn at real pixel size: a ResizeObserver measures the plot box (its height is fixed in CSS, 260 px / 220 px on
 * phones, so nothing shifts) and the SVG's viewBox equals that size, so text and line widths are true pixels.
 * Animation: plays once when >= 50% of the chart is visible. A clip rect sweeps left to right over 3.4 s
 * (ease-in-out) with a faint playhead; "Traffic arrives" appears as the sweep passes 0 and the line-end labels fade
 * in at the end. It replays on mouse hover (only once finished), on tap / click, and on Enter / Space (tabindex 0).
 * The sweep writes SVG attributes directly in rAF (no React render per frame); rAF runs only while it plays.
 * Rule 8 / reduced motion: the server HTML is the finished chart; it is hidden for the sweep only after hydration
 * and only when motion is allowed. Under reduced motion it stays finished and never replays.
 * Accessibility: the plot is one named image (aria-label, from site.ts); the SVG and the legend are hidden from
 * screen readers (they repeat it); the caption is ordinary text.
 */
"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import data from "@/data/scaling-chart.json";
import { site } from "@/content/site";
import { useMotionAllowed } from "@/lib/useMotionAllowed";

const X_MIN = data.x[0];
const X_MAX = data.x[data.x.length - 1];
const SWEEP_MS = 3400;
const SSR_SIZE = { w: 520, h: 260 }; // server render / no-JS: scaled to the box by the viewBox
const WIDE = 460; // chart width from which the line-end labels fit on the right
const NARROW = 420; // below this width the x labels are shortened (-2m ...)
const C = { traffic: "#ff9a66", reactive: "#8b95a5", predictive: "#6fb0e0", text: "#9aa3ad", guide: "rgba(233, 238, 244, 0.28)" };

type Size = { w: number; h: number };

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Scales and margins for one size. The right margin makes room for the line-end labels on wide charts. */
function layout({ w, h }: Size) {
  const wide = w >= WIDE;
  const m = { top: 40, right: wide ? 82 : 14, bottom: 28, left: 14 };
  const x = (s: number) => m.left + ((s - X_MIN) / (X_MAX - X_MIN)) * (w - m.left - m.right);
  const y = (v: number) => h - m.bottom - (v / 100) * (h - m.top - m.bottom);
  return { wide, m, x, y, left: m.left, right: w - m.right };
}

const linePath = (values: number[], x: (s: number) => number, y: (v: number) => number) =>
  values.map((v, i) => `${i ? "L" : "M"}${x(data.x[i]).toFixed(1)},${y(v).toFixed(1)}`).join("");

export default function ScalingChart() {
  const copy = site.projects.chart;
  const motion = useMotionAllowed();
  const clipId = useId();
  const gradId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const clipRef = useRef<SVGRectElement>(null);
  const headRef = useRef<SVGLineElement>(null);
  const [size, setSize] = useState<Size>(SSR_SIZE);
  const sizeRef = useRef<Size>(SSR_SIZE);
  const progressRef = useRef(1); // 0 = nothing drawn, 1 = finished (the server HTML)
  const playingRef = useRef(false);
  const rafRef = useRef(0);

  // Draw the sweep at progress p (0..1, already eased): clip width, playhead, marker and end-label classes.
  const apply = useCallback((p: number) => {
    const box = boxRef.current;
    const clip = clipRef.current;
    const head = headRef.current;
    if (!box || !clip || !head) return;
    const L = layout(sizeRef.current);
    const sweepX = L.left + p * (L.right - L.left);
    // at the end the clip opens fully, so the round line caps past the last point are not cut
    clip.setAttribute("width", String(p >= 1 ? sizeRef.current.w : Math.max(0, sweepX)));
    head.setAttribute("x1", sweepX.toFixed(1));
    head.setAttribute("x2", sweepX.toFixed(1));
    box.classList.toggle("is-marker", sweepX >= L.x(0));
    box.classList.toggle("is-done", p >= 1);
  }, []);

  const play = useCallback(() => {
    if (playingRef.current || !window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    playingRef.current = true;
    boxRef.current?.classList.add("is-playing");
    const start = performance.now();
    const frame = (now: number) => {
      const t = Math.min(1, (now - start) / SWEEP_MS);
      progressRef.current = t >= 1 ? 1 : easeInOut(t);
      apply(progressRef.current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        playingRef.current = false;
        boxRef.current?.classList.remove("is-playing");
      }
    };
    rafRef.current = requestAnimationFrame(frame);
  }, [apply]);

  // Real pixel size: the box's CSS size becomes the viewBox.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    const ro = new ResizeObserver(() => {
      const next = { w: Math.round(box.clientWidth), h: Math.round(box.clientHeight) };
      if (next.w > 0 && next.h > 0) setSize((s) => (s.w === next.w && s.h === next.h ? s : next));
    });
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  // After every size change, re-apply the current progress before paint (React re-rendered the full clip).
  useLayoutEffect(() => {
    sizeRef.current = size;
    apply(progressRef.current);
  }, [size, apply]);

  // With motion allowed: hide the drawing (after hydration only) and play it once when half of it is in view.
  useEffect(() => {
    const box = boxRef.current;
    if (!motion || !box) return undefined;
    progressRef.current = 0;
    apply(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.5) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(box);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafRef.current);
      playingRef.current = false;
      progressRef.current = 1; // never leave the chart hidden (e.g. strict-mode remount)
      apply(1);
    };
  }, [motion, apply, play]);

  // Replays: a mouse hover (touch fires click instead), a tap / click, Enter or Space.
  const onPointerEnter = (e: PointerEvent) => {
    if (e.pointerType === "mouse" && progressRef.current >= 1) play();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault(); // Space would otherwise scroll the page while the chart has focus
    play();
  };

  const L = layout(size);
  const { w, h } = size;
  const narrow = w < NARROW;
  const trafficArea = `${linePath(data.traffic, L.x, L.y)}L${L.x(X_MAX).toFixed(1)},${L.y(0).toFixed(1)}L${L.x(X_MIN).toFixed(1)},${L.y(0).toFixed(1)}Z`;

  return (
    <figure className="chart">
      <div
        ref={boxRef}
        className="chart-plot"
        role="img"
        aria-label={copy.ariaLabel}
        tabIndex={0}
        onPointerEnter={onPointerEnter}
        onClick={play}
        onKeyDown={onKeyDown}
      >
        <svg viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={C.traffic} stopOpacity="0.3" />
              <stop offset="1" stopColor={C.traffic} stopOpacity="0" />
            </linearGradient>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <rect ref={clipRef} x="0" y="0" width={w} height={h} />
            </clipPath>
          </defs>

          {/* labels and guides (never clipped) */}
          <text className="chart-ylabel" x={L.left} y="16">
            {copy.yLabel}
          </text>
          <line x1={L.left} x2={L.right} y1={L.y(100)} y2={L.y(100)} stroke={C.guide} strokeWidth="1" strokeDasharray="2 4" />
          <text x={L.left} y={L.y(100) - 6}>
            100%
          </text>
          <line x1={L.left} x2={L.right} y1={L.y(0)} y2={L.y(0)} stroke="rgba(233, 238, 244, 0.12)" strokeWidth="1" />
          {copy.xLabels.map((t) => (
            <text key={t.at} x={L.x(t.at)} y={h - 8} textAnchor="middle">
              {narrow ? t.short : t.long}
            </text>
          ))}

          {/* the data, revealed by the sweeping clip */}
          <g clipPath={`url(#${clipId})`}>
            <path d={trafficArea} fill={`url(#${gradId})`} />
            <path d={linePath(data.reactive, L.x, L.y)} fill="none" stroke={C.reactive} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
            <path d={linePath(data.predictive, L.x, L.y)} fill="none" stroke={C.predictive} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          </g>

          {/* t = 0: dotted marker, its label to its left just above the axis (the space there is empty) */}
          <g className="chart-marker">
            <line x1={L.x(0)} x2={L.x(0)} y1={L.y(100) - 8} y2={L.y(0)} stroke={C.traffic} strokeOpacity="0.75" strokeWidth="1" strokeDasharray="2 3" />
            <text x={L.x(0) - 6} y={L.y(0) - 7} textAnchor="end">
              {copy.marker}
            </text>
          </g>

          {/* line-end labels: both lines end at 100%, so one sits above the end point and one below (colours: CSS) */}
          {L.wide ? (
            <g className="chart-endlabels">
              <text x={L.right + 8} y={L.y(100) - 4}>
                {copy.predictive}
              </text>
              <text x={L.right + 8} y={L.y(100) + 13}>
                {copy.reactive}
              </text>
            </g>
          ) : null}

          <line ref={headRef} className="chart-head" x1={L.right} x2={L.right} y1={L.y(100) - 8} y2={L.y(0)} />
        </svg>
      </div>
      <div className="chart-legend" aria-hidden="true">
        <span className="chart-key chart-key--predictive">{copy.predictive}</span>
        <span className="chart-key chart-key--reactive">{copy.reactive}</span>
      </div>
      <figcaption className="chart-caption">{copy.caption}</figcaption>
    </figure>
  );
}
