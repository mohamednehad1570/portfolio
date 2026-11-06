/**
 * AboutSideways (#about): the About topics as a scroll-driven "sideways stack" on every screen size (ADR 0010).
 *
 * How it works: the section itself is a tall "pin" box (it carries #about) holding a sticky stage (CSS
 * `position: sticky`, so the page itself does the pinning, no scroll library). The stage holds the heading
 * (eyebrow + H2), the four slides and the dots (ADR 0011). While the visitor scrolls DOWN the normal way, a progress
 * value x (0 to 3) moves the slides SIDEWAYS: the next topic waits off the right edge and slides in over the current
 * one; passed topics step a little left, shrink, dim, and their text fades out, so their edges peek out behind.
 * Nothing captures the wheel or touch, there is no snapping, and sideways swipes do nothing: the horizontal
 * movement is only a picture of the vertical scroll position (native scrolling rule, ADR 0003/0010/0011).
 *
 * Rest-then-move pacing (ADR 0011): each topic owns SEG = REST + MOVE viewport heights of scroll. During REST
 * nothing moves (time to read); during MOVE the next topic slides in, eased with smoothstep.
 *   pin height = viewH * (1 + 3 * SEG + REST + HOLD)           (CSS, sections.css; viewH = stage height)
 *   sv = max(0, scrollY - pinStart) / viewH;  k = min(3, floor(sv / SEG));  within = sv - k * SEG
 *   x  = k                                        while within < REST (or once k = 3)
 *   x  = k + smoothstep((within - REST) / MOVE)    otherwise
 *   slide i, d = i - x:
 *     d >= 0  translateX = left0 + min(d, 1.05) * (stageWidth - left0 + 20)      (waiting or in front)
 *     d <  0  depth = min(-d, 3); translateX = left0 - depth * PEEK; scale(1 - 0.05 * depth)   (passed)
 *             and CSS turns --depth into photo brightness and text opacity.
 * Per frame only transform and the --depth variable change (no layout reads while scrolling): measurements are
 * taken on every ScrollTrigger refresh (resize, font load). The refresh also sizes the square photo so heading,
 * photo, the longest topic's text and the dots always fit in the stage (above the phone's bottom pill).
 *
 * Text (ADR 0008/0010): the front topic changes with hysteresis (x - front >= 0.55 going forward, front - x >= 0.55
 * going back), and each time a topic becomes front its words play again (WordReveal). Topic 1 plays when the pin
 * first reaches the top of the viewport.
 *
 * Reduced motion / no JavaScript / before hydration: no pin and no `is-side` class, so the topics are a plain
 * vertical list of photo + number + title + text, all visible.
 */
"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { Eyebrow, Heading } from "./SectionText";
import WordReveal from "./WordReveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Pacing (ADR 0011). Shares of the viewport height, also written to the pin as CSS custom properties so the pin
// height in sections.css and the progress maths here cannot drift apart.
const REST = 0.55; // scroll distance a topic stays perfectly still before the next one starts to move in
const MOVE = 0.45; // scroll distance over which the next topic slides in (smoothstep eased)
const SEG = REST + MOVE; // one topic's share: arrival to arrival = 1.0 viewport height
const HOLD = 0.3; // the last topic keeps REST + HOLD before the section releases
const FRONT_SWITCH = 0.55; // x must pass the front topic by this much to change it (hysteresis, both directions)
const OFFSCREEN = 1.05; // a waiting slide sits this far (in slide-travels) to the right: just past the edge
const MARGIN_RIGHT = 20; // px past the stage edge that a waiting slide parks at
const SHRINK = 0.05; // scale lost per step of depth
const MAX_DEPTH = 3;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (t: number) => t * t * (3 - 2 * t); // eases in and out, flat at both ends: no jolt at rest edges
const MIN_PHOTO = 96; // px: the photo never shrinks below this, even on very short screens
const pad2 = (n: number) => String(n).padStart(2, "0");

export default function AboutSideways() {
  const { about } = site;
  const topics = about.topics;
  const sectionRef = useRef<HTMLElement>(null); // the section is also the pin box
  const motionAllowed = useMotionAllowed();
  // Per topic: are its words shown, and how many times has it come to the front (a change = replay)
  const [reveal, setReveal] = useState(() => topics.map(() => ({ show: false, n: 0 })));
  const [front, setFront] = useState(0); // drives the progress dots

  useGSAP(
    () => {
      const pin = sectionRef.current;
      if (!motionAllowed || !pin) return undefined;
      const stage = pin.querySelector<HTMLElement>(".side-stage");
      const head = pin.querySelector<HTMLElement>(".about-head");
      const dots = pin.querySelector<HTMLElement>(".side-dots");
      const slides = Array.from(pin.querySelectorAll<HTMLElement>(".side-slide"));
      const texts = Array.from(pin.querySelectorAll<HTMLElement>(".side-text"));
      const card = pin.querySelector<HTMLElement>(".side-card");
      if (!stage || !head || !dots || !card || slides.length < 2) return undefined;
      const count = slides.length;
      const last = count - 1;
      const lastDepth = slides.map(() => -1);
      const lastTransform = slides.map(() => "");
      let frontIdx = 0;
      let entered = false; // has the pin reached the top of the viewport?

      let pinStart = 0; // scrollY at which the stage sticks (document px)
      let viewH = 1; // stage height (px)
      let stageW = 0;
      let left0 = 0; // where a slide sits when it is in front (centred in the stage)
      let peek = 22; // px each passed slide steps left

      // Measured on every refresh (resize, font load, phone toolbar). No layout reads while scrolling.
      const measure = () => {
        const st = getComputedStyle(stage);
        const stickyTop = parseFloat(st.top) || 0;
        pinStart = pin.getBoundingClientRect().top + window.scrollY - stickyTop;
        viewH = Math.max(1, stage.offsetHeight);
        stageW = stage.clientWidth;
        left0 = (stageW - slides[0].offsetWidth) / 2;
        peek = parseFloat(st.getPropertyValue("--side-peek")) || 22;

        // Photo size that fits: the stage minus its padding, the heading, the dots and the gaps between them.
        // Photo on top (tablet, phone): also minus the card gap and the tallest topic text (its width does not
        // depend on the photo there). Photo beside the text (desktop): the photo only needs the height itself.
        const gap = parseFloat(st.rowGap) || 0;
        const room = viewH - (parseFloat(st.paddingTop) || 0) - (parseFloat(st.paddingBottom) || 0) - head.offsetHeight - dots.offsetHeight - 2 * gap;
        const cs = getComputedStyle(card);
        const stacked = cs.flexDirection === "column";
        const tallestText = Math.max(...texts.map((t) => t.offsetHeight));
        const fit = stacked ? room - (parseFloat(cs.rowGap) || 0) - tallestText : room;
        stage.style.setProperty("--side-photo-fit", `${Math.max(MIN_PHOTO, Math.floor(fit))}px`);
      };

      // Scroll position -> progress x (0..last), rest-then-move (see the header comment).
      const progress = (scroll: number) => {
        const sv = Math.max(0, scroll - pinStart) / viewH;
        const k = Math.min(last, Math.floor(sv / SEG));
        if (k >= last) return last;
        const within = sv - k * SEG;
        return within < REST ? k : k + smoothstep(clamp01((within - REST) / MOVE));
      };

      const update = () => {
        const scroll = window.scrollY;
        const x = progress(scroll);

        slides.forEach((slide, i) => {
          const d = i - x;
          let tx: number;
          let scale = 1;
          let depth = 0;
          if (d >= 0) {
            tx = left0 + Math.min(d, OFFSCREEN) * (stageW - left0 + MARGIN_RIGHT);
          } else {
            depth = Math.min(-d, MAX_DEPTH);
            tx = left0 - depth * peek;
            scale = 1 - SHRINK * depth;
          }
          const t = `translate3d(${tx.toFixed(1)}px,0,0) scale(${scale.toFixed(4)})`;
          if (t !== lastTransform[i]) {
            slide.style.transform = t;
            lastTransform[i] = t;
          }
          if (Math.abs(depth - lastDepth[i]) > 0.001) {
            slide.style.setProperty("--depth", depth.toFixed(3));
            lastDepth[i] = depth;
          }
        });

        // Front topic with hysteresis: it changes only when x is 0.55 past it, in either direction.
        let next = frontIdx;
        while (next < last && x - next >= FRONT_SWITCH) next++;
        while (next > 0 && next - x >= FRONT_SWITCH) next--;
        const nowEntered = scroll >= pinStart - 2;
        const before = entered ? frontIdx : -1; // "effective" front: -1 until the pin reaches the top of the viewport,
        const after = nowEntered ? next : -1; // so all text is reset (and replays) when the visitor scrolls back above it
        frontIdx = next;
        entered = nowEntered;
        if (after === before) return;

        const becameFront = after >= 0;
        setFront(frontIdx);
        setReveal((prev) => {
          let touched = false;
          const out = prev.map((r, i) => {
            if (becameFront && i === after) {
              touched = true;
              return { show: true, n: r.n + 1 }; // new count = the words remount hidden and play again
            }
            if (i > after && r.show) {
              touched = true;
              return { show: false, n: r.n }; // topics ahead of the front have no words yet (reset for the next time)
            }
            return r; // passed topics keep their words; CSS fades them out with depth
          });
          return touched ? out : prev;
        });
      };

      ScrollTrigger.create({
        trigger: pin,
        start: "top bottom",
        end: "bottom top",
        onUpdate: update,
        onLeave: update, // make sure the end states are applied
        onLeaveBack: update,
        onRefresh: () => {
          measure();
          update();
        },
      });
      measure();
      update();
      return undefined; // useGSAP removes the trigger on cleanup
    },
    { scope: sectionRef, dependencies: [motionAllowed], revertOnUpdate: true },
  );

  return (
    // The section is the pin box: it carries #about so a nav click lands on the pin start (scroll-margin-top in CSS).
    <section
      id="about"
      ref={sectionRef}
      className={`about-side side-pin${motionAllowed ? " is-side" : ""}`}
      style={{ "--side-rest": REST, "--side-move": MOVE, "--side-hold": HOLD } as CSSProperties}
    >
      <div className="side-stage">
        <div className="about-head">
          <Eyebrow text={about.label} />
          <Heading tag="h2" text={about.title} className="h2" />
        </div>
        <ol className="side-slides">
          {topics.map((t, i) => (
            <li key={t.title} className="side-slide" style={{ zIndex: i }}>
              <div className="side-card">
                <figure className="side-photo">
                  {/* "Who I am" reuses the hero photo: it must be eager like the hero, or Next.js warns that the LCP image is lazy */}
                  <Image src={t.image} alt="" width={624} height={800} loading={t.image === site.hero.photo.src ? "eager" : "lazy"} />
                </figure>
                <div className="side-text">
                  <p className="side-num" aria-hidden="true">
                    {pad2(i + 1)} / {pad2(topics.length)}
                  </p>
                  <WordReveal as="h3" className="side-title" text={t.title} play={reveal[i].show} replay={reveal[i].n} animate={motionAllowed} stagger={0.08} />
                  <WordReveal className="body side-body" text={t.body} play={reveal[i].show} replay={reveal[i].n} animate={motionAllowed} startDelay={0.26} stagger={0.035} />
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="side-dots" aria-hidden="true">
          {topics.map((t, i) => (
            <span key={t.title} className={`side-dot${i === front ? " is-active" : ""}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
