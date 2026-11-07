/**
 * `pnpm images`: turns the original photos (outside the repo) into small web files in public/images/generated/,
 * plus a typed manifest the components read (ADR 0013).
 * Why at build time with sharp: the site is a static export (`images.unoptimized`), so there is no image server;
 * the files are made once here, committed, and the build stays deterministic and offline.
 *
 * Steps: check every source first (stop with a clear message if one is missing), wipe the output folder, encode,
 * write the manifest. Metadata (EXIF, GPS, ICC, text chunks) is never copied: sharp drops it unless asked to keep it.
 * The person in a cutout is never retouched: only resized (same 4:5 aspect) and encoded; alpha is kept.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile, stat } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import config from "./images.config.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const photosDir = process.env.SITE_PHOTOS_DIR || path.join(homedir(), "Pictures", "site-photos");
const outDir = path.join(root, config.outDir);
const manifestPath = path.join(root, config.manifest);

// Encoder settings, chosen by measuring the error over the site's navy background (see ADR 0013).
// AVIF q75: ~55 KB at 840 px with clean edges. WebP q88 with lossless alpha (alphaQuality 100): no banding in
// the bottom fade. PNG fallback is lossless: a 256-colour palette shifted alpha by up to 51/255 and banded the fade.
const AVIF = { quality: 75, effort: 6 }; // effort 9 saved 0.2 KB but took 3x as long
const WEBP = { quality: 88, alphaQuality: 100, effort: 6, smartSubsample: true };
const PNG = { compressionLevel: 9, adaptiveFiltering: true }; // no `effort`/`palette`: those switch to lossy palette mode
const JPEG = { quality: 80, mozjpeg: true };
const OG_JPEG = { quality: 85, mozjpeg: true, chromaSubsampling: "4:4:4" }; // flat navy: 4:4:4 avoids colour bleed at the edge

const fail = (msg) => {
  console.error(`\n✖ images: ${msg}\n`);
  process.exit(1);
};
const sourcePath = (file) => (path.isAbsolute(file) ? file : path.join(photosDir, file));
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

// Which ids the committed manifest already has: an optional photo that was generated before may not vanish silently.
async function previouslyGenerated() {
  if (!existsSync(manifestPath)) return new Set();
  const text = await readFile(manifestPath, "utf8");
  return new Set([...text.matchAll(/^ {2}"([\w-]+)": \{/gm)].map((m) => m[1]));
}

// 1. Check every source before touching any output.
const before = await previouslyGenerated();
const jobs = [];
const problems = [];
for (const img of config.images) {
  const src = sourcePath(img.file);
  if (existsSync(src)) jobs.push({ ...img, src });
  else if (img.required) problems.push(`"${img.id}" source is missing: ${src}`);
  else if (before.has(img.id)) problems.push(`"${img.id}" was generated before, but its source is now missing: ${src}`);
  else console.log(`· ${img.id}: not provided yet (${src}), skipped`);
}
if (problems.length) {
  fail(
    `${problems.join("\n  ")}\n  Nothing was changed. Put the original in ${photosDir} (or set SITE_PHOTOS_DIR), ` +
      `or edit scripts/images.config.mjs.`,
  );
}

// 2. Fresh output folder: no stale files from earlier runs.
await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const written = [];
const out = async (pipeline, name) => {
  const file = path.join(outDir, name);
  await pipeline.toFile(file);
  written.push([name, (await stat(file)).size]);
  return `${config.urlBase}/${name}`;
};

// 3. Encode.
const manifest = {};
for (const img of jobs) {
  const meta = await sharp(img.src).metadata();
  if (img.kind === "cutout" && !meta.hasAlpha) fail(`"${img.id}" is a cutout but ${img.src} has no transparency.`);
  const ratio = meta.height / meta.width;
  const heightFor = (w) => Math.round(w * ratio);
  // fit "fill" with the rounded height: no crop at all (the 4:5 source is 1325 x 1656, so the stretch is < 0.02 %).
  const resized = (w) => sharp(img.src).resize(w, heightFor(w), { fit: "fill", kernel: "lanczos3" });

  const variants = [];
  for (const w of img.widths) {
    const avif = await out(resized(w).avif(AVIF), `${img.id}-${w}.avif`);
    const webp = await out(resized(w).webp(WEBP), `${img.id}-${w}.webp`);
    variants.push({ width: w, height: heightFor(w), avif, webp });
  }
  const srcSet = (fmt) => variants.map((v) => `${v[fmt]} ${v.width}w`).join(", ");
  const fw = img.fallbackWidth;
  const fallback =
    img.kind === "cutout"
      ? await out(resized(fw).png(PNG), `${img.id}-${fw}.png`) // JPEG cannot be transparent
      : await out(resized(fw).flatten({ background: "#0a1626" }).jpeg(JPEG), `${img.id}-${fw}.jpg`);

  manifest[img.id] = {
    width: fw,
    height: heightFor(fw),
    src: fallback,
    avifSrcSet: srcSet("avif"),
    webpSrcSet: srcSet("webp"),
    variants, // one entry per width, e.g. for a single absolute URL (structured data)
  };

  // Open Graph card: the cutout standing on the right of a plain navy canvas, bottom-aligned so the fade meets the edge.
  if (img.og) {
    const { width: W, height: H, background } = img.og;
    const h = Math.round(H * 0.95);
    const person = await sharp(img.src).resize(Math.round(h / ratio), h, { fit: "fill" }).png().toBuffer();
    const pw = Math.round(h / ratio);
    const canvas = sharp({ create: { width: W, height: H, channels: 3, background } })
      .composite([{ input: person, top: H - h, left: W - pw - Math.round(W * 0.08) }])
      .jpeg(OG_JPEG);
    manifest[img.id].og = { src: await out(canvas, img.og.file), width: W, height: H };
  }
}

// 4. Manifest: plain data with a fixed key order, so re-running on the same sources gives the same file.
const body = JSON.stringify(manifest, null, 2);
await writeFile(
  manifestPath,
  `/**
 * GENERATED by \`pnpm images\` (scripts/images.mjs, ADR 0013). Do not edit by hand: re-run the script instead.
 * What: every web image made from the originals in ~/Pictures/site-photos, with its srcsets and fallback size.
 * Why a file: components read URLs and intrinsic sizes from here, so a new photo needs no code change.
 */

export type GeneratedImage = {
  width: number; // intrinsic size of the fallback file (sets the aspect ratio, so no layout shift)
  height: number;
  src: string; // fallback (PNG for cutouts, JPEG for photos)
  avifSrcSet: string;
  webpSrcSet: string;
  variants: { width: number; height: number; avif: string; webp: string }[]; // smallest to largest
  og?: { src: string; width: number; height: number };
};

export const generatedImages: Record<string, GeneratedImage | undefined> = ${body};
`,
);

for (const [name, size] of written) console.log(`✓ ${name.padEnd(24)} ${kb(size).padStart(10)}`);
console.log(`✓ manifest ${path.relative(root, manifestPath)}`);
