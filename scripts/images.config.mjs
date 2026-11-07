/**
 * Image pipeline config (ADR 0013): which original photos `pnpm images` turns into web files.
 * Why a separate file: adding a photo later means dropping it into the photos folder and, at most, editing this list.
 *
 * Originals live OUTSIDE the repo (never commit them). Folder: $SITE_PHOTOS_DIR, or ~/Pictures/site-photos by default.
 * `file` is a name inside that folder, or an absolute path.
 *
 * kind "cutout": transparent PNG (person with the background removed). Output keeps the alpha channel exactly:
 *   AVIF + WebP (with alpha) at each width, a lossless PNG fallback, and optionally the Open Graph card.
 * kind "photo": ordinary photo. AVIF + WebP at each width and a JPEG fallback; aspect kept, the page crops with CSS.
 * required: false = "not ready yet". Missing is fine until the first time it is generated; after that a missing
 *   source stops the script (so old images are never kept silently).
 */
const config = {
  outDir: "public/images/generated", // relative to the project root; wiped and rewritten on every run
  urlBase: "/images/generated", // the same folder as the browser sees it
  manifest: "src/content/images.generated.ts", // typed list of what was generated, read by the components
  images: [
    {
      id: "hero",
      file: "hero-cutout-final.png", // 1325 x 1656 (4:5), suit fades to transparent at the bottom
      kind: "cutout",
      required: true,
      widths: [480, 840, 1200],
      fallbackWidth: 840,
      og: { file: "og-image.jpg", width: 1200, height: 630, background: "#0a1626" },
    },
    // About photos (not ready yet): drop the files into the photos folder and run `pnpm images`.
    { id: "about-who", file: "about-who.jpg", kind: "photo", required: false, widths: [480, 720, 1000], fallbackWidth: 720 },
    { id: "about-work", file: "about-work.jpg", kind: "photo", required: false, widths: [480, 720, 1000], fallbackWidth: 720 },
    { id: "about-study", file: "about-study.jpg", kind: "photo", required: false, widths: [480, 720, 1000], fallbackWidth: 720 },
    { id: "about-beyond", file: "about-beyond.jpg", kind: "photo", required: false, widths: [480, 720, 1000], fallbackWidth: 720 },
  ],
};

export default config;
