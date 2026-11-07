/**
 * Image helpers over the generated manifest (ADR 0013).
 * Why: the hero photo, its `sizes` and the Open Graph card are needed by several files (Hero, layout, JSON-LD);
 * they read them from here so the numbers live in one place.
 */
import { generatedImages, type GeneratedImage } from "@/content/images.generated";

/** A generated image that must exist (the build fails with a clear message if `pnpm images` was not run). */
export function requireImage(id: string): GeneratedImage {
  const img = generatedImages[id];
  if (!img) throw new Error(`Generated image "${id}" is missing: run \`pnpm images\` (scripts/images.mjs).`);
  return img;
}

export const HERO_IMAGE = requireImage("hero");

// The hero photo's rendered width, matching sections.css (keep in sync with .hero-grid / .hero-photo-wrap):
// phones (<= 760px): max-width 280px. Tablet/desktop: the photo column is 0.85 / (1.15 + 0.85) of the grid
// = 0.425 x (viewport - 2 x 40px padding - 64px gap), capped at 420px (reached at a 1132px viewport).
export const HERO_SIZES = "(max-width: 760px) 280px, (max-width: 1131px) calc((100vw - 144px) * 0.425), 420px";

/** Preload href: the AVIF at the fallback's width (840px), the size most phones and desktops pick anyway. */
export const HERO_PRELOAD_HREF = (HERO_IMAGE.variants.find((v) => v.width === HERO_IMAGE.width) ?? HERO_IMAGE.variants[0]).avif;

/** The largest hero file, as an absolute-able path for structured data. */
export const HERO_LARGEST = HERO_IMAGE.variants[HERO_IMAGE.variants.length - 1];

/** The Open Graph / Twitter card (1200 x 630). */
export const OG_IMAGE = HERO_IMAGE.og ?? (() => {
  throw new Error('The hero entry in scripts/images.config.mjs needs an "og" card.');
})();
