/**
 * `pnpm images`: turns the original photos (outside the repo) into small web files in public/images/generated/,
 * plus a typed manifest the components read (ADR 0013).
 * Why at build time with sharp: the site is a static export (`images.unoptimized`), so there is no image server;
 * the files are made once here, committed, and the build stays deterministic and offline.
 *
 * Steps: check every source first (stop with a clear message if one is missing), wipe the output folder, encode,
 * write the manifest. Metadata (EXIF, GPS, ICC, text chunks) is never copied: sharp drops it unless asked to keep it.
 * The person in a cutout is never retouched or re-masked: only resized (same aspect) and encoded; alpha is kept.
 * Optional `fx` (the hero, batch 9): a soft edge fade (alpha x mask) and a light cool grade, computed per pixel in
 * plain JS on the source before resizing, so the output stays deterministic. The OG card is made from the plain source.
 * Batch 12: kind "screenshot" (a tall page capture) takes its own AVIF quality and uses the WebP as its fallback.
 * Batch 13: optional `particles` samples the processed image into a small JSON of star-dust points (see writeParticles).
 * Batch 16: the site icons (see writeIcons): src/app/favicon.ico (16/32/48 px, packed by ImageMagick) and
 * src/app/apple-icon.png (180 px), both rendered from src/app/icon.svg; Next's file-based metadata links all three.
 */
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile, stat } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
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
const smoothstep = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t)); // soft ends: no visible band at either edge

// fx: returns the source as raw RGBA with the grade and the edge fade applied (see images.config.mjs).
async function applyFx(src, { fade, grade }) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const clamp255 = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
  for (let y = 0; y < H; y++) {
    const v = y / (H - 1); // 0 top .. 1 bottom
    const bottom = 1 - smoothstep((v - (1 - fade.bottom)) / fade.bottom);
    const sideOn = smoothstep((v - fade.sideFrom) / (fade.sideFull - fade.sideFrom)); // 0 above, 1 in the lower part
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const edge = Math.min(x, W - 1 - x) / (W - 1); // 0 at either side .. 0.5 in the middle
      const side = 1 - sideOn * (1 - smoothstep(edge / fade.side));
      data[i + 3] = clamp255(data[i + 3] * bottom * side);
      // grade: pull towards the pixel's luminance (saturation), then cool it slightly
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      data[i] = clamp255((l + (r - l) * grade.saturation) * grade.red);
      data[i + 1] = clamp255(l + (g - l) * grade.saturation);
      data[i + 2] = clamp255((l + (b - l) * grade.saturation) * grade.blue);
    }
  }
  return { data, raw: { width: W, height: H, channels: 4 } };
}

// particles: the image exactly as shown (fx applied, resized to `width`) sampled on a grid; every cell centre with
// alpha > threshold becomes [x, y, r, g, b], x and y scaled to 0..1000 of the photo box. Over `max`: keep evenly
// spaced entries of the row-by-row list (index i * n / max), so the thinning is uniform over the figure.
// Deterministic (no randomness): the same source always gives the same file.
async function writeParticles(pipeline, { file, width, step, alpha, max }) {
  const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  if (W !== width) fail(`particles: expected a ${width} px wide image, got ${W}`);
  const all = [];
  for (let y = step / 2; y < H; y += step) {
    for (let x = step / 2; x < W; x += step) {
      const i = (Math.floor(y) * W + Math.floor(x)) * 4;
      if (data[i + 3] > alpha) all.push([Math.round((x / W) * 1000), Math.round((y / H) * 1000), data[i], data[i + 1], data[i + 2]]);
    }
  }
  const kept = all.length > max ? Array.from({ length: max }, (_, k) => all[Math.floor((k * all.length) / max)]) : all;
  const json = `{\n  "source": "scripts/images.mjs (pnpm images): hero cutout at ${width} px, ${step} px grid, alpha > ${alpha}; ${all.length} points, thinned evenly to ${kept.length}. [x, y, r, g, b], x and y on 0..1000 of the photo box.",\n  "points": [\n${kept.map((p) => `    [${p.join(",")}]`).join(",\n")}\n  ]\n}\n`;
  await writeFile(path.join(root, file), json);
  console.log(`✓ particles ${file}: ${all.length} on the grid, ${kept.length} kept`);
}

// Which ids the committed manifest already has: an optional photo that was generated before may not vanish silently.
async function previouslyGenerated() {
  if (!existsSync(manifestPath)) return new Set();
  const text = await readFile(manifestPath, "utf8");
  return new Set([...text.matchAll(/^ {2}"([\w-]+)": \{/gm)].map((m) => m[1]));
}

// Site icons (batch 16), all from the one source src/app/icon.svg (a 64-unit viewBox):
//  - favicon.ico: 16 and 32 px from a bolder copy (stroke 5, star radius 5.5) so the M stays readable that small,
//    48 px from the source as is; ImageMagick packs the three PNGs into one ICO (no npm dependency);
//  - apple-icon.png: 180 px with square corners (iOS rounds them itself, so no transparent corners).
// Each size is rendered straight from the SVG at its own density (no downscaling), with no metadata.
async function writeIcons() {
  const appDir = path.join(root, "src", "app");
  const svg = await readFile(path.join(appDir, "icon.svg"), "utf8");
  const bold = svg.replace(/stroke-width="[\d.]+"/, 'stroke-width="5"').replace(/ r="[\d.]+"/g, ' r="5.5"');
  const square = svg.replace(/ rx="[\d.]+"/, "");
  if (bold === svg || square === svg) fail("icon.svg no longer matches the icon step (stroke-width / r / rx).");
  const render = (source, size) =>
    sharp(Buffer.from(source), { density: (72 * size) / 64 }).resize(size, size).png(PNG);

  const tmp = await mkdtemp(path.join(tmpdir(), "site-icons-"));
  try {
    const pngs = [];
    for (const [size, source] of [[16, bold], [32, bold], [48, svg]]) {
      const file = path.join(tmp, `icon-${size}.png`);
      await render(source, size).toFile(file);
      pngs.push(file);
    }
    const ico = path.join(appDir, "favicon.ico");
    try {
      await promisify(execFile)("magick", [...pngs, ico]);
    } catch (err) {
      fail(`packing favicon.ico needs ImageMagick 7 (\`magick\`): ${err.message}`);
    }
    await render(square, 180).toFile(path.join(appDir, "apple-icon.png"));
    for (const name of ["favicon.ico", "apple-icon.png"]) {
      written.push([`src/app/${name}`, (await stat(path.join(appDir, name))).size]);
    }
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
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
  // fit "fill" with the rounded height: no crop at all (rounding the height stretches by well under 0.1 %).
  const fx = img.fx ? await applyFx(img.src, img.fx) : null;
  const source = () => (fx ? sharp(fx.data, { raw: fx.raw }) : sharp(img.src));
  const resized = (w) => source().resize(w, heightFor(w), { fit: "fill", kernel: "lanczos3" });

  const variants = [];
  // per-image AVIF quality (the tall screenshot uses q50); everything else keeps the measured default
  const avifOpts = img.avifQuality ? { ...AVIF, quality: img.avifQuality } : AVIF;
  for (const w of img.widths) {
    const avif = await out(resized(w).avif(avifOpts), `${img.id}-${w}.avif`);
    const webp = await out(resized(w).webp(WEBP), `${img.id}-${w}.webp`);
    variants.push({ width: w, height: heightFor(w), avif, webp });
  }
  const srcSet = (fmt) => variants.map((v) => `${v[fmt]} ${v.width}w`).join(", ");
  const fw = img.fallbackWidth;
  const fallback =
    img.kind === "cutout"
      ? await out(resized(fw).png(PNG), `${img.id}-${fw}.png`) // JPEG cannot be transparent
      : img.kind === "screenshot"
        ? variants.find((v) => v.width === fw)?.webp ?? fail(`"${img.id}": fallbackWidth must be one of its widths`) // the WebP is the fallback
        : await out(resized(fw).flatten({ background: "#0a1626" }).jpeg(JPEG), `${img.id}-${fw}.jpg`);

  if (img.particles) await writeParticles(resized(img.particles.width), img.particles);

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
  src: string; // fallback (PNG for cutouts, JPEG for photos, WebP for screenshots)
  avifSrcSet: string;
  webpSrcSet: string;
  variants: { width: number; height: number; avif: string; webp: string }[]; // smallest to largest
  og?: { src: string; width: number; height: number };
};

export const generatedImages: Record<string, GeneratedImage | undefined> = ${body};
`,
);

// 5. Site icons (batch 16, see writeIcons).
await writeIcons();

for (const [name, size] of written) console.log(`✓ ${name.padEnd(24)} ${kb(size).padStart(10)}`);
console.log(`✓ manifest ${path.relative(root, manifestPath)}`);
