/**
 * ScrollingShot: a tall full-page screenshot inside the browser frame that glides from the top of the page to the
 * bottom and back, as if someone were scrolling it (batch 12, website card).
 * Why CSS keyframes: the loop is a plain translateY (compositor only); JS only measures how far to travel (--end)
 * and starts / pauses the loop. One cycle (~14 s): hold at the top, glide down, hold, glide back up (sections.css).
 * It runs only while at least half the frame is on screen (IntersectionObserver) and is paused otherwise.
 * Rule 8 / reduced motion: without JavaScript --end is unset (0) and the loop stays paused, and reduced motion
 * switches the animation off, so the frame is a still view of the top of the page. The image loads lazily; the
 * frame's size never depends on it, so nothing shifts when it arrives.
 */
"use client";

import { useEffect, useRef } from "react";
import { requireImage } from "@/lib/images";
import Picture from "./Picture";

// The frame is at most ~560 px wide (two cards in a 1200 px column) and the full width on phones.
const SIZES = "(max-width: 760px) calc(100vw - 40px), 560px";

export default function ScrollingShot({ imageId, alt }: { imageId: string; alt: string }) {
  const image = requireImage(imageId);
  const boxRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return undefined;
    // --end = how far the image moves up: its rendered height (from the file's aspect) minus the visible window
    const measure = () => {
      const end = Math.max(0, box.clientWidth * (image.height / image.width) - box.clientHeight);
      box.style.setProperty("--end", `${end.toFixed(1)}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    // run the loop only while >= 50% of the frame is visible
    const io = new IntersectionObserver(([entry]) => box.classList.toggle("is-playing", entry.intersectionRatio >= 0.5), {
      threshold: [0, 0.5],
    });
    io.observe(box);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, [image.height, image.width]);

  return (
    <span ref={boxRef} className="frame-shot frame-shot--scroll">
      <Picture className="shot-scroll" image={image} alt={alt} sizes={SIZES} />
    </span>
  );
}
