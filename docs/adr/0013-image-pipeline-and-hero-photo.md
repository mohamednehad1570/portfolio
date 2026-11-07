# ADR 0013: Image pipeline (sharp at build time) and the frameless hero cutout

- Status: Accepted (decision D14 amended, 2026-11-07, approved by Mohammed on a preview: the photo standing directly on the starfield, no frame). D14 was "hero photo in a 24 px rounded rectangle"; it is now "**frameless transparent cutout on the starfield**".
- Date: 2026-11-07
- Related: [0001](0001-stack-and-static-hosting.md) (static export, `images.unoptimized`), [0002](0002-night-sky-background.md), [0005](0005-text-animation-system.md), [0011](0011-about-rest-pacing-and-booking-buttons.md), [0012](0012-hosting-cloudflare-workers.md)

## Context
The hero photo is the page's Largest Contentful Paint (LCP) element. Lighthouse (mobile) on the live site measured LCP 3.6–5.4 s, of which ~2.0–2.5 s was *element render delay*: the photo had downloaded but stayed `opacity: 0` inside a `Reveal` until JavaScript hydrated. The file was a single 35 KB JPEG at one size for every screen. Mohammed now has a background-removed portrait (`hero-cutout-final.png`, 1325 × 1656, 4:5, suit fading to transparent at the bottom) that should stand directly on the starfield. A static export has no image server, and `next/image` is unoptimized here, so nothing makes responsive or modern-format files for us.

## Options considered
- **Keep `next/image` unoptimized with one file:** no work, but one size for all screens, no AVIF/WebP, and a transparent PNG at that size is ~1 MB.
- **An image CDN / Cloudflare Images:** resizes on request, but adds a paid or external service and runtime dependency for a handful of photos.
- **sharp at build time, files committed (chosen):** a small script makes every size and format once; the output is plain static files, the build stays offline and deterministic, and the originals never enter the repo.

## Decision
- **Pipeline:** `pnpm images` runs `scripts/images.mjs` with the list in `scripts/images.config.mjs`. Originals are read from `~/Pictures/site-photos/` (or `$SITE_PHOTOS_DIR`) and **never committed**. Output goes to `public/images/generated/` (wiped and rewritten each run, so no stale files) plus a typed manifest, `src/content/images.generated.ts`, that the components read. `sharp` is a devDependency only (no install script needed: it ships prebuilt platform binaries, and `pnpm-workspace.yaml` already lists it as `false`).
- **Strict sources:** a missing required source stops the script before anything is written. Optional sources (the About photos, not ready yet) are skipped until they first exist; once generated, a missing source also stops the script, so old images are never kept silently.
- **Cutout (hero), alpha kept, person untouched:** only resized (exact 4:5, `fit: fill`, no crop) and encoded. Widths 480 / 840 / 1200 as **AVIF** (q75) and **WebP with lossless alpha** (q88, `alphaQuality` 100), plus a **lossless PNG** fallback at 840. Settings were chosen by measuring the error after compositing on the site's navy: a 256-colour palette PNG shifted alpha by up to 51/255 and banded the fade, so the PNG stays lossless (836 KB; only browsers without WebP and AVIF ever load it). Edges and the bottom fade were checked over a star pattern: no halos, no banding.
- **Open Graph card:** `og-image.jpg`, 1200 × 630, the cutout bottom-aligned on the right of a plain `#0a1626` canvas, no text (34 KB). Twitter card type `summary_large_image`. JSON-LD `image` = the 1200 px hero WebP.
- **Metadata:** sharp copies no EXIF/GPS/ICC/XMP unless asked; verified on every output.
- **Hero markup:** `<picture>` with AVIF, then WebP `<source>`s, `<img>` = PNG fallback with `width`/`height` (no layout shift), `loading="eager"`, `fetchpriority="high"`, `decoding="async"`, and `sizes` that match the grid (`src/lib/images.ts`, `HERO_SIZES`).
- **LCP preload:** `preload()` from `react-dom` in `Hero.tsx` renders `<link rel="preload" as="image" type="image/avif" imagesrcset imagesizes fetchpriority="high">` into `<head>` of the static HTML (verified in `out/index.html`), right after the font preloads and before the CSS.
- **Never hidden:** the photo is opaque in the server HTML. Its entrance is a CSS-only `transform` slide (no opacity) that starts with the first paint, not after hydration; reduced motion turns it off.
- **D14 amended, frameless:** no radius, border, shadow, background or glow on the photo; the stars show around the person and through the faded suit. Size and position on every screen are unchanged. On tablet/desktop the hero grid is **bottom-aligned** (`align-items: end`), so the faded suit ends level with the bottom of the text block (the buttons). The photo is the taller item, so it keeps its place and the text moves down ~38 px. Aligning with the bottom of the hero section was rejected: it would move the photo ~170 px down.
- **About photos later:** each topic has a `photoId`; once `pnpm images` has produced that id, `AboutSideways` uses the generated `<picture>` automatically, otherwise the current placeholder.

## Consequences
- Adding or replacing a photo = put the original in `~/Pictures/site-photos/`, run `pnpm images`, commit the generated files. Re-running on the same sources gives byte-identical files (checked).
- A full run takes about a minute (AVIF encoding; `effort` 6, because 9 saved 0.2 KB for 3x the time).
- File names in `/images/generated/` carry no content hash, so they are not cached as `immutable` (unlike `/_next/static/`). If a photo is replaced, browsers may show the old one until their normal cache expires; a hash in the name is a possible later step.
- `public/images/hero.jpg` stays: it is still the "Who I am" About placeholder.
- The `sizes` string must be kept in step with the hero grid CSS (comment in both places).
