/**
 * AboutStack (#about): the About topics as a React Bits card stack of photos with the topic text beside / below it
 * (ADR 0015, supersedes the scroll-driven stack of 0010 / 0014). A normal section: no pin, no scroll listeners;
 * the page scrolls straight through it (the top card has `touch-action: pan-y`, so a finger on the photo still
 * scrolls the page; only sideways drags move the card).
 *
 * The visitor changes topic by dragging / flicking or tapping the top card, the arrow buttons, the dots, or the arrow
 * keys while the stack has focus. The stack reports its top card (`onChange`), and the text panel shows that topic.
 *
 * Three views of the same four topics:
 *  - `.about-list`: a plain list (photo + title + text). Shown as is without JavaScript (no `js` class on <html>);
 *    with JavaScript its photos are removed and the list becomes screen-reader only: screen readers get all four
 *    topics once, in order.
 *  - `.about-deck` (only under `.js`): the stack, the controls and the hint.
 *  - `.about-panel` (inside the deck, `aria-hidden`): the four text blocks share one grid cell, so its height always
 *    fits the tallest one and nothing shifts; only the top card's block is visible (the others `visibility: hidden`).
 *    The visible block's words play (WordReveal) when the section first comes into view and again on every change.
 * Reduced motion: the stack stays (it uses short fades then), the words appear without animation.
 */
"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { site } from "@/content/site";
import { requireImage } from "@/lib/images";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import Picture from "../Picture";
import TodoText from "../TodoText";
import Stack, { type StackHandle } from "../rb/Stack";
import { Eyebrow, Heading } from "./SectionText";
import WordReveal from "./WordReveal";

// Rendered photo width, matching sections.css (.about-stack-box): 440px beside the text on desktop, otherwise
// min(100% - room for the fan, 420px) inside the 16px / 40px page gutters. The plain list (no JS) uses the same files.
const PHOTO_SIZES = "(max-width: 1024px) min(calc(100vw - 96px), 420px), 440px";
const PHONE_QUERY = "(max-width: 760px)";

// Card corner radius: 22px, 16px on phones (the Stack takes it as a number, so it is read from a media query).
const subscribePhone = (onChange: () => void) => {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const usePhone = () => useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE_QUERY).matches, () => false);

export default function AboutStack() {
  const { about } = site;
  const topics = about.topics;
  const motionAllowed = useMotionAllowed();
  const phone = usePhone();
  const stackRef = useRef<StackHandle>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(0); // index of the topic whose card is on top
  const [seen, setSeen] = useState(false); // has the panel come into view? (the first words wait for it)
  const [replay, setReplay] = useState(() => topics.map(() => 0)); // per topic: a new value plays its words again

  // Play the first topic's words once the panel is on screen.
  useEffect(() => {
    const el = panelRef.current;
    if (!el || seen) return undefined;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setSeen(true), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  const onChange = (index: number) => {
    setTop(index);
    setReplay((prev) => prev.map((n, i) => (i === index ? n + 1 : n)));
  };

  const cards = topics.map((t) => (
    <Picture key={t.photoId} image={requireImage(t.photoId)} alt={t.alt} sizes={PHOTO_SIZES} draggable={false} />
  ));

  return (
    <section id="about" className="about">
      <div className="about-wrap">
        <div className="about-head">
          <Eyebrow text={about.label} />
          <Heading tag="h2" text={about.title} className="h2" />
        </div>

        {/* Plain list: visible without JavaScript; screen-reader only (photos removed) with it. */}
        <ol className="about-list">
          {topics.map((t) => (
            <li key={t.title} className="about-item">
              <figure className="about-item-photo">
                <Picture image={requireImage(t.photoId)} alt={t.alt} sizes={PHOTO_SIZES} />
              </figure>
              <div>
                <h3 className="about-title">{t.title}</h3>
                <p className="body about-body">
                  <TodoText text={t.body} />
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="about-deck">
          <div className="about-stack-box">
            <Stack
              ref={stackRef}
              cards={cards}
              layout="fan"
              visible={4}
              spread={0.5}
              depth={0.5}
              radius={phone ? 16 : 22}
              shadow
              tilt={30}
              threshold={90}
              sendToBackOnClick
              autoplay={false}
              onChange={onChange}
              label={about.stackLabel}
            />
          </div>

          <div className="about-controls">
            <button type="button" className="about-arrow" aria-label={about.prevLabel} onClick={() => stackRef.current?.prev()}>
              <span aria-hidden="true">‹</span>
            </button>
            <div className="about-dots" role="group" aria-label={about.dotsLabel}>
              {topics.map((t, i) => (
                <button
                  key={t.title}
                  type="button"
                  className={`about-dot${i === top ? " is-active" : ""}`}
                  aria-label={about.dotLabel(i + 1, topics.length, t.title)}
                  aria-current={i === top ? "true" : undefined}
                  onClick={() => stackRef.current?.goTo(i)}
                />
              ))}
            </div>
            <button type="button" className="about-arrow" aria-label={about.nextLabel} onClick={() => stackRef.current?.next()}>
              <span aria-hidden="true">›</span>
            </button>
          </div>
          <p className="about-hint" aria-hidden="true">
            {about.hint}
          </p>

          {/* Visual text only: screen readers get the plain list above. */}
          <div className="about-panel" ref={panelRef} aria-hidden="true">
            {topics.map((t, i) => (
              <div key={t.title} className={`about-block${i === top ? " is-active" : ""}`}>
                <WordReveal as="p" className="about-title" text={t.title} play={seen && i === top} replay={replay[i]} animate={motionAllowed} stagger={0.08} />
                <WordReveal className="body about-body" text={t.body} play={seen && i === top} replay={replay[i]} animate={motionAllowed} startDelay={0.26} stagger={0.035} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
