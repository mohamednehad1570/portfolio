/**
 * useMotionAllowed: true when the visitor has NOT asked the system to reduce motion.
 * Why: the pinned About gallery, the cubes and similar effects must be skipped for `prefers-reduced-motion: reduce`.
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

/** Starts downloading a lazy chunk when the browser is idle, so the fallback is rarely seen. */
export function preloadWhenIdle(load: () => Promise<unknown>): () => void {
  if (typeof window === "undefined") return () => {};
  const run = () => void load();
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(run, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = globalThis.setTimeout(run, 1500); // Safari has no requestIdleCallback
  return () => globalThis.clearTimeout(id);
}
