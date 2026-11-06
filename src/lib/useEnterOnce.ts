/**
 * useEnterOnce: adds the class `is-in` to an element the first time ~`threshold` of it is on screen, then stops watching.
 * Why: one tiny shared "play once when visible" trigger for the CSS entrances (Reveal, the contact rings).
 * It changes a class directly on the DOM node (no React state, so no re-render). The hidden "before" look is
 * only applied by CSS under the `js` class (rule 8), so without JavaScript the element is simply visible.
 */
import { useEffect, type RefObject } from "react";

export function useEnterOnce(ref: RefObject<HTMLElement | null>, threshold = 0.2) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-in");
          io.disconnect(); // enter-once
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
}
