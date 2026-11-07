# CLAUDE.md: Mohammed Nehad portfolio site

One-page portfolio + web-dev services site. English, worldwide clients, free intro call, no pressure.
Next.js static export. See `AGENTS.md` for the Next.js version note (read the docs in `node_modules/next/dist/docs/` before using unfamiliar APIs).

## Stack
- Next.js 16 (App Router, `src/`, `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`), React 19, TypeScript strict
- Tailwind CSS v4 (tokens in `@theme` in `src/app/globals.css`) + plain CSS files that ship with React Bits components
- GSAP (+ `@gsap/react`, ScrollTrigger, SplitText) and Motion 12 (`motion/react`)
- Dark night-sky theme (ADR 0004); background is a Canvas 2D starfield (ADR 0002); About is a scroll-driven sideways stack: a pinned `position: sticky` stage whose topics move sideways with the normal vertical scroll (ADR 0010, 0011)
- About pacing constants (ADR 0011, 0014, amend 0008/0010), defined once in `sections/AboutSideways.tsx` and shared with the CSS: rest-then-move, each topic = `REST = 0.75` (nothing moves) + `MOVE = 0.45` (next topic slides in, smoothstep) viewport heights; `HOLD = 0.3` (the last topic keeps REST + HOLD before release); front-item hysteresis 0.55. About focus helpers (ADR 0014), all of which scroll the PAGE to a topic's settle point (middle of its REST) and stop on any input: an idle settle (200 ms after the visitor stops, only mid-move, only in their direction of travel, never outside the pin), a touch swipe on the stage (touch only, `touch-action: pan-y pinch-zoom`), and tappable dot buttons. No "01 / 04" numbers. The About heading sits inside the pinned stage; the pin carries `#about`. Domain mohammednehad.com, email hello@mohammednehad.com (ADR 0009).
- One text animation system (ADR 0005); Contact is five rotating text rings (ADR 0006); booking is a link to Cal.com, no embed, shown as buttons that open a new tab once the URL is external (ADR 0007, 0011)
- Fonts via `next/font/google`: Bricolage Grotesque (display), Instrument Sans (body)
- Images (ADR 0013): `pnpm images` (sharp, build-time only) turns originals in `~/Pictures/site-photos/` (never committed) into AVIF/WebP/fallback files in `public/images/generated/` + the manifest `src/content/images.generated.ts`; commit the generated files. Hero = frameless transparent cutout on the starfield (D14), the LCP image: never hidden, preloaded.
- Package manager: pnpm. Free / open source only. No tracking, no cookies, no secrets.
- Hosting (ADR 0012): Cloudflare Workers static assets serving `out/` (config `wrangler.jsonc`, headers `public/_headers`), live at https://mohammednehad.com (`www` 301s to the apex). Cloudflare Workers Builds deploys from GitHub: push to `main` = production deploy; push to any other branch = preview version with its own `*.workers.dev` preview URL (noindex). Never touch the Proton Mail DNS records in the Cloudflare zone.

## Rules
1. Scope: do only what was asked. If something is unclear or a decision is missing, stop and ask.
2. Every file gets a short header comment (what, why). Comment intent and non-obvious code. React Bits files keep their author header; each change is marked `// MODIFIED: <why>`.
3. Use the latest *stable* versions, verified in official docs/npm at build time.
4. Content: never invent skills, numbers, testimonials or results. `[bracketed]` text is a placeholder Mohammed writes; keep it grey (`.todo`).
5. Accessibility: one H1, semantic landmarks, visible focus, 44px targets, everything works with `prefers-reduced-motion: reduce`.
6. Add every new technical term to `docs/glossary.md` (Term | Discipline | Meaning | Where in this project).
7. The phone number appears only inside the `wa.me` link, never as visible text.
8. Decisions are recorded as ADRs in `docs/adr/`; never silently reverse one.
9. Native scrolling only: no Lenis or other smooth-scroll library, no element that captures the mouse wheel, no `preventDefault` on vertical scroll, no inner scroll boxes, **no scroll snapping** (ADR 0003, 0008, 0010, 0011). The About's sideways motion only follows vertical scroll. **About only (ADR 0014):** a soft idle settle after the visitor stops, a sideways touch swipe and tappable dots are allowed; the visitor must always be able to scroll straight past it (mouse, trackpad, keyboard, touch). Native CSS snapping was tested there and rejected (it trapped a slow mouse wheel).
10. Visible without animation: every animated element is fully visible when JavaScript has not run and under `prefers-reduced-motion: reduce`. Hide pre-animation states only after hydration: a tiny inline script puts a `js` class on `<html>`, and CSS hides under it (`.js [data-reveal]:not(.is-in) { opacity: 0 }`). Never hide in the server HTML.

## Folder map
- `src/app/`: routes, layout, global CSS, sitemap, robots
- `src/components/`: site components; `src/components/sections/` = section components with helpers (About sideways stack, section heads, Contact rings); `src/components/icons/` = inline SVG logos (no icon library); `src/components/rb/` = vendored React Bits (see its README)
- Text animation roles (ADR 0005): eyebrow/hero = `TextType` (via `TypedText`), H2/H3 = `SplitText`, intro line = `BlurText`, body paragraph = `Reveal from="fade"`. Use these; do not add per-section effects.
- `src/content/site.ts`: all page copy as typed data (no copy hard-coded in components)
- `src/lib/`: shared helpers (colour constants, site URL, reduced-motion hook)
- `public/images/`: photos (`generated/` = output of `pnpm images`; do not edit by hand)
- `scripts/`: build-time scripts (`images.mjs` + `images.config.mjs`)
- `docs/`: ADRs and glossary
- `reference/prototype/`: approved Vite prototype (documentation only; excluded from lint/tsc)

## Gates (run after every change)
```bash
pnpm exec tsc --noEmit   # type errors
pnpm lint                # ESLint
pnpm build               # static export into out/
```

## Git
`main` = production: every push to `main` deploys the live site (ADR 0012). Work on a feature branch (its pushes get preview URLs) and merge into `main` with `--no-ff`. One commit per part, Conventional Commits (`type(scope): description`). Do not push unless asked. GitHub: `mohamednehad1570/portfolio` (public).
