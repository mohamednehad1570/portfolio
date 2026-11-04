# CLAUDE.md: Mohammed Nehad portfolio site

One-page portfolio + web-dev services site. English, worldwide clients, free intro call, no pressure.
Next.js static export. See `AGENTS.md` for the Next.js version note (read the docs in `node_modules/next/dist/docs/` before using unfamiliar APIs).

## Stack
- Next.js 16 (App Router, `src/`, `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true`), React 19, TypeScript strict
- Tailwind CSS v4 (tokens in `@theme` in `src/app/globals.css`) + plain CSS files that ship with React Bits components
- GSAP (+ `@gsap/react`, ScrollTrigger, SplitText) and Motion 12 (`motion/react`)
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

## Folder map
- `src/app/`: routes, layout, global CSS, sitemap, robots
- `src/components/`: site components; `src/components/rb/` = vendored React Bits (see its README)
- `src/content/site.ts`: all page copy as typed data (no copy hard-coded in components)
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
