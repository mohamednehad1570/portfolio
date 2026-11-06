# CLAUDE.md: Mohammed Nehad portfolio site

One-page portfolio + web-dev services site. English, worldwide clients, free intro call, no pressure.
Next.js static export. See `AGENTS.md` for the Next.js version note (read the docs in `node_modules/next/dist/docs/` before using unfamiliar APIs).

## Stack
- Next.js 16 (App Router, `src/`, `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`), React 19, TypeScript strict
- Tailwind CSS v4 (tokens in `@theme` in `src/app/globals.css`) + plain CSS files that ship with React Bits components
- GSAP (+ `@gsap/react`, ScrollTrigger, SplitText) and Motion 12 (`motion/react`)
- Dark night-sky theme (ADR 0004); background is a Canvas 2D starfield (ADR 0002); About is a native sticky scroll stack (ADR 0003)
- One text animation system (ADR 0005); Contact is five rotating text rings (ADR 0006); booking is a link to Cal.com, no embed (ADR 0007)
- Fonts via `next/font/google`: Bricolage Grotesque (display), Instrument Sans (body)
- Package manager: pnpm. Free / open source only. No tracking, no cookies, no secrets.

## Rules
1. Scope: do only what was asked. If something is unclear or a decision is missing, stop and ask.
2. Every file gets a short header comment (what, why). Comment intent and non-obvious code. React Bits files keep their author header; each change is marked `// MODIFIED: <why>`.
3. Use the latest *stable* versions, verified in official docs/npm at build time.
4. Content: never invent skills, numbers, testimonials or results. `[bracketed]` text is a placeholder Mohammed writes; keep it grey (`.todo`).
5. Accessibility: one H1, semantic landmarks, visible focus, 44px targets, everything works with `prefers-reduced-motion: reduce`.
6. Add every new technical term to `docs/glossary.md` (Term | Discipline | Meaning | Where in this project).
7. The phone number appears only inside the `wa.me` link, never as visible text.
8. Decisions are recorded as ADRs in `docs/adr/`; never silently reverse one.
9. Native scrolling only: no Lenis or other smooth-scroll library, no element that captures the mouse wheel, no inner scroll boxes (ADR 0003).
10. Visible without animation: every animated element is fully visible when JavaScript has not run and under `prefers-reduced-motion: reduce`. Hide pre-animation states only after hydration: a tiny inline script puts a `js` class on `<html>`, and CSS hides under it (`.js [data-reveal]:not(.is-in) { opacity: 0 }`). Never hide in the server HTML.

## Folder map
- `src/app/`: routes, layout, global CSS, sitemap, robots
- `src/components/`: site components; `src/components/sections/` = section components with helpers (About scroll stack, section heads, Contact rings); `src/components/icons/` = inline SVG logos (no icon library); `src/components/rb/` = vendored React Bits (see its README)
- Text animation roles (ADR 0005): eyebrow/hero = `TextType` (via `TypedText`), H2/H3 = `SplitText`, intro line = `BlurText`, body paragraph = `Reveal from="fade"`. Use these; do not add per-section effects.
- `src/content/site.ts`: all page copy as typed data (no copy hard-coded in components)
- `src/lib/`: shared helpers (colour constants, site URL, reduced-motion hook)
- `public/images/`: photos
- `docs/`: ADRs and glossary
- `reference/prototype/`: approved Vite prototype (documentation only; excluded from lint/tsc)

## Gates (run after every change)
```bash
pnpm exec tsc --noEmit   # type errors
pnpm lint                # ESLint
pnpm build               # static export into out/
```

## Git
`main` = production. Work on `feat/site-v1`. One commit per part, Conventional Commits (`type(scope): description`). Do not push unless asked.
