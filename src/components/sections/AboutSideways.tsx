/**
 * AboutSideways (#about): the About topics as a scroll-driven "sideways stack" on every screen size (ADR 0010).
 *
 * How it works: the section itself is a tall "pin" box (it carries #about) holding a sticky stage (CSS
 * `position: sticky`, so the page itself does the pinning, no scroll library). The stage holds the heading
 * (eyebrow + H2), the four slides and the dots (ADR 0011). While the visitor scrolls DOWN the normal way, a progress
 * value x (0 to 3) moves the slides SIDEWAYS: the next topic waits off the right edge and slides in over the current
 * one; passed topics step a little left, shrink, dim, and their text fades out, so their edges peek out behind.
 * The horizontal movement is only a picture of the vertical scroll position: scrolling stays native and nothing
 * captures the wheel or blocks vertical touch (ADR 0003/0010/0011, amended by 0014).
 *
 * Focus helpers (ADR 0014), all moving the PAGE to a topic's settle point (the middle of its REST), so vertical
 * position and visible topic always agree, and all stopped at once by any wheel, touch, pointer or key input:
 *  - idle settle: once the visitor STOPS mid-move (200 ms without scrolling, nothing held down), the page eases
 *    to the nearest topic if x is within 0.35 of it and that is the way they were scrolling (never back against
 *    them); never outside the pin, never after a nav/go-to-top link;
 *  - touch swipe on the stage: left = next topic, right = previous (|dx| >= 40 px and >= 1.5 x |dy|);
 *  - the dots are buttons: a tap / Enter scrolls to that topic.
 *
 * Rest-then-move pacing (ADR 0011, slowed in 0014): each topic owns SEG = REST + MOVE viewport heights of scroll. During REST
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
 * While the stage is pinned, <html> gets the class `about-pinned`; on phones CSS uses it to fade the go-to-top
 * button out (it is not needed inside the stack, and its space goes to the photo instead).
 *
 * Reduced motion / no JavaScript / before hydration: no pin and no `is-side` class, so the topics are a plain
 * vertical list of photo + title + text, all visible; no dots, no settle, no swipe handling.
 */
"use client";

import { useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import { generatedImages } from "@/content/images.generated";
import Picture from "../Picture";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { Eyebrow, Heading } from "./SectionText";
import WordReveal from "./WordReveal";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Pacing (ADR 0011). Shares of the viewport height, also written to the pin as CSS custom properties so the pin
// height in sections.css and the progress maths here cannot drift apart.
const REST = 0.75; // scroll distance a topic stays perfectly still before the next one starts to move in
const MOVE = 0.45; // scroll distance over which the next topic slides in (smoothstep eased)
const SEG = REST + MOVE; // one topic's share: arrival to arrival = 1.2 viewport heights (ADR 0014)
const HOLD = 0.3; // the last topic keeps REST + HOLD before the section releases
const FRONT_SWITCH = 0.55; // x must pass the front topic by this much to change it (hysteresis, both directions)
const OFFSCREEN = 1.05; // a waiting slide sits this far (in slide-travels) to the right: just past the edge
const MARGIN_RIGHT = 20; // px past the stage edge that a waiting slide parks at
const SHRINK = 0.05; // scale lost per step of depth
const MAX_DEPTH = 3;
const SWIPE_MIN = 40; // px of sideways travel before a touch counts as a swipe
const SWIPE_RATIO = 1.5; // and it must be this much more sideways than vertical
const GO_MS = 500; // dot tap / swipe: scroll tween to the topic
const SETTLE_IDLE = 200; // ms with no scrolling before the idle settle looks at the position
const SETTLE_RANGE = 0.35; // settle only when x is this close (in topics) to a whole topic
const SETTLE_MS = 450; // idle settle tween

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smoothstep = (t: number) => t * t * (3 - 2 * t); // eases in and out, flat at both ends: no jolt at rest edges
const MIN_PHOTO = 96; // px: the photo never shrinks below this, even on very short screens
// Rendered photo width (sections.css .side-photo): full slide width on phones, up to 500px on tablet, 440px on desktop.
const ABOUT_SIZES = "(max-width: 760px) calc(100vw - 32px), (max-width: 1024px) 500px, 440px";

export default function AboutSideways() {
  const { about } = site;
  const topics = about.topics;
  const sectionRef = useRef<HTMLElement>(null); // the section is also the pin box
  const motionAllowed = useMotionAllowed();
  // Per topic: are its words shown, and how many times has it come to the front (a change = replay)
  const [reveal, setReveal] = useState(() => topics.map(() => ({ show: false, n: 0 })));
  const [front, setFront] = useState(0); // drives the progress dots
  const goToRef = useRef<((i: number) => void) | null>(null); // set while pinned mode runs: scroll to topic i

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
      let pinned = false; // is the stage stuck right now? (mirrored as `about-pinned` on <html>)
      const root = document.documentElement;

      let pinStart = 0; // scrollY at which the stage sticks (document px)
      let pinEnd = 0; // scrollY at which it lets go (bottom of the pin box reaches the bottom of the stage)
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
        pinEnd = pinStart + pin.offsetHeight - viewH;
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

        // Class change only when the state flips (no DOM write per frame).
        const nowPinned = scroll >= pinStart - 2 && scroll <= pinEnd;
        if (nowPinned !== pinned) {
          pinned = nowPinned;
          root.classList.toggle("about-pinned", pinned);
        }

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

      // ---- Scroll tween: dots, swipes and the idle settle move the PAGE (never the slides directly) ----
      // The visitor stays in control: any wheel, touch, pointer or key input stops a running tween at once.
      const settleScroll = (i: number) => pinStart + (i * SEG + REST / 2) * viewH; // middle of topic i's REST
      let tweenId = 0;
      let tweening = false;
      const cancelTween = () => {
        if (!tweening) return;
        cancelAnimationFrame(tweenId);
        tweening = false;
      };
      const tweenTo = (target: number, ms: number) => {
        cancelTween();
        const from = window.scrollY;
        const dist = target - from;
        if (Math.abs(dist) < 1) return;
        tweening = true;
        const t0 = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - t0) / ms);
          const e = 1 - Math.pow(1 - t, 3); // ease-out cubic
          // "instant": the page's `scroll-behavior: smooth` would otherwise animate every single frame again
          window.scrollTo({ top: Math.round(from + dist * e), behavior: "instant" });
          if (t < 1) tweenId = requestAnimationFrame(step);
          else tweening = false;
        };
        tweenId = requestAnimationFrame(step);
      };
      goToRef.current = (i: number) => tweenTo(settleScroll(Math.max(0, Math.min(last, i))), GO_MS);

      // ---- Idle settle (ADR 0014): only after the visitor has stopped ----
      // Native `scroll-snap-type: y proximity` was tried first and rejected: in Chrome a slow mouse wheel was pulled
      // back to the first topic after every notch and could not get past About. This runs only when nothing has
      // scrolled for SETTLE_IDLE ms, no finger or button is down, no nav/go-to-top scroll is running, the page is
      // inside the pin, and the stage is mid-move but within SETTLE_RANGE (in topic progress x) of a topic that lies in
      // the visitor's direction of travel.
      let idleTimer = 0;
      let held = false; // a finger is on the screen or a mouse button is down (e.g. dragging the scrollbar)
      let navScroll = false; // an in-page link (nav, go-to-top) started the browser's own smooth scroll
      const trySettle = () => {
        idleTimer = 0;
        if (held || tweening) return;
        if (navScroll) {
          navScroll = false; // that scroll has finished where the link wanted: leave it there
          return;
        }
        const scroll = window.scrollY;
        if (scroll < pinStart || scroll > pinEnd) return; // never settle outside the pin
        const x = progress(scroll);
        const k = Math.round(x);
        const off = Math.abs(x - k);
        if (off < 0.001 || off > SETTLE_RANGE) return; // already at rest, or right in the middle of a move
        // Only ever finish a move in the direction the visitor was going, never pull them back: a slow wheel
        // (one notch, pause, one notch) would otherwise be pulled back after every notch and never get past.
        if ((k - x) * travel < 0) return;
        tweenTo(settleScroll(k), SETTLE_MS);
      };
      const armIdle = () => {
        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(trySettle, SETTLE_IDLE);
      };
      let lastY = window.scrollY;
      let travel = 0; // direction of the visitor's last scroll: 1 down, -1 up (our own tweens do not count)
      const onScroll = () => {
        const y = window.scrollY;
        if (!tweening) {
          if (y !== lastY) travel = y > lastY ? 1 : -1;
          armIdle(); // our own tween is not "the visitor scrolling"
        }
        lastY = y;
      };
      const onInput = () => {
        cancelTween();
        navScroll = false;
        if (idleTimer) armIdle(); // input pushes a pending settle back; it never starts one on its own
      };
      const onHold = () => {
        held = true;
        onInput();
      };
      const onRelease = () => {
        if (!held) return;
        held = false;
        armIdle(); // a finger lifted without momentum still gets its settle check
      };
      const onClick = (e: MouseEvent) => {
        if ((e.target as Element | null)?.closest?.('a[href^="#"]')) navScroll = true;
      };
      const listen: [EventTarget, string, EventListener][] = [
        [window, "scroll", onScroll],
        [window, "wheel", onInput],
        [window, "keydown", onInput],
        [window, "touchstart", onHold],
        [window, "pointerdown", onHold],
        [window, "touchend", onRelease],
        [window, "touchcancel", onRelease],
        [window, "pointerup", onRelease],
        [window, "pointercancel", onRelease],
        [document, "click", onClick as EventListener],
      ];
      // all passive: nothing here ever blocks or cancels the browser's own scrolling
      listen.forEach(([t, ev, fn]) => t.addEventListener(ev, fn, { passive: true, capture: true }));

      // ---- Touch swipe on the stage: left = next topic, right = previous (touch only, passive) ----
      // CSS `touch-action: pan-y pinch-zoom` keeps vertical panning with the browser; a vertical pan ends in
      // pointercancel, so only a clearly sideways gesture reaches pointerup here.
      let sx = 0;
      let sy = 0;
      let sid = -1;
      const onDown = (e: PointerEvent) => {
        if (e.pointerType !== "touch" || !e.isPrimary) return;
        sid = e.pointerId;
        sx = e.clientX;
        sy = e.clientY;
      };
      const onUp = (e: PointerEvent) => {
        if (e.pointerId !== sid) return;
        sid = -1;
        const dx = e.clientX - sx;
        const dy = e.clientY - sy;
        if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < SWIPE_RATIO * Math.abs(dy)) return;
        const target = frontIdx + (dx < 0 ? 1 : -1);
        if (target < 0 || target > last) return; // first / last topic: nothing to go to, no fake movement
        // after the window's pointerup (onRelease, capture) has run, so the release cannot cancel this tween
        tweenTo(settleScroll(target), GO_MS);
      };
      const onCancel = (e: PointerEvent) => {
        if (e.pointerId === sid) sid = -1; // the browser took the gesture over (vertical pan): not a swipe
      };
      const swipe: [string, (e: PointerEvent) => void][] = [
        ["pointerdown", onDown],
        ["pointerup", onUp],
        ["pointercancel", onCancel],
      ];
      swipe.forEach(([ev, fn]) => stage.addEventListener(ev, fn as EventListener, { passive: true }));

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
      // useGSAP removes the trigger on cleanup; the class must go too (e.g. switching to reduced motion mid-pin)
      return () => {
        cancelTween();
        window.clearTimeout(idleTimer);
        goToRef.current = null;
        listen.forEach(([t, ev, fn]) => t.removeEventListener(ev, fn, { capture: true }));
        swipe.forEach(([ev, fn]) => stage.removeEventListener(ev, fn as EventListener));
        root.classList.remove("about-pinned");
      };
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
                  {/* A generated photo (ADR 0013) once `pnpm images` has made one for this topic, else the placeholder.
                      All lazy: the hero cutout is now the LCP image, so "Who I am" no longer shares its file. */}
                  {generatedImages[t.photoId] ? (
                    <Picture image={generatedImages[t.photoId]!} alt="" sizes={ABOUT_SIZES} />
                  ) : (
                    <Image src={t.image} alt="" width={624} height={800} loading="lazy" />
                  )}
                </figure>
                <div className="side-text">
                  <WordReveal as="h3" className="side-title" text={t.title} play={reveal[i].show} replay={reveal[i].n} animate={motionAllowed} stagger={0.08} />
                  <WordReveal className="body side-body" text={t.body} play={reveal[i].show} replay={reveal[i].n} animate={motionAllowed} startDelay={0.26} stagger={0.035} />
                </div>
              </div>
            </li>
          ))}
        </ol>
        {/* Dots: real buttons (ADR 0014). Only shown in pinned mode (CSS); each scrolls the page to its topic. */}
        <div className="side-dots" role="group" aria-label={about.dotsLabel}>
          {topics.map((t, i) => (
            <button
              key={t.title}
              type="button"
              className={`side-dot${i === front ? " is-active" : ""}`}
              aria-label={about.dotLabel(i + 1, topics.length, t.title)}
              aria-current={i === front ? "true" : undefined}
              onClick={() => goToRef.current?.(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
