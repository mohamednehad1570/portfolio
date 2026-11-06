/**
 * useMotionAllowed: true when the visitor has NOT asked the system to reduce motion.
 * Why: the About scroll stack, the starfield's motion and similar effects must be skipped for `prefers-reduced-motion: reduce`.
 * Returns false on the server and during hydration, so the page first renders in its calm, static form and
 * only upgrades to the animated one in the browser (no mismatch between server HTML and client).
 */
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: no-preference)";

const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

export function useMotionAllowed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

/** Runs `load` (e.g. starts downloading a lazy chunk, or mounts a decorative layer) when the browser is idle. */
export function preloadWhenIdle(load: () => unknown): () => void {
  if (typeof window === "undefined") return () => {};
  const run = () => void load();
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(run, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = globalThis.setTimeout(run, 1500); // Safari has no requestIdleCallback
  return () => globalThis.clearTimeout(id);
}
