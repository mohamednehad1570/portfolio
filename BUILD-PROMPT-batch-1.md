# Claude Code — Batch 1: build Mohammed Nehad's portfolio site (local, no deploy yet)

You are building a one-page portfolio + web-dev services website for **Mohammed Nehad** (worldwide clients, English, free intro call, no pressure).
An approved prototype exists in `./reference/prototype/` (Vite + React). **Port its look and behaviour into a production Next.js project.** Do not copy the Vite setup.

## 0. Rules (apply to every part)
1. **Scope:** do only what this prompt says. If something is unclear or a decision is missing, stop and ask; do not invent.
2. **Comments:** every file gets a short header comment (what it is, why it exists). Comment intent and non-obvious code, not obvious lines. Files edited from React Bits keep their author header and mark each change with `// MODIFIED: <why>`.
3. **Versions:** use the latest *stable* versions, verified in official docs/npm at build time (Next.js 16.x, React 19.x, Tailwind CSS v4, GSAP 3.x, Motion 12.x). Do not rely on memory.
4. **Free / open source only.** No paid services, no tracking, no cookies.
5. **Content:** never invent skills, numbers, testimonials or results. Text in `[brackets]` is a placeholder Mohammed will write; keep it visibly grey (`.todo` style).
6. **Accessibility:** one H1, semantic landmarks, visible focus, 44px targets, everything works with `prefers-reduced-motion: reduce` (animations off or static).
7. **Terminology:** at the end, add every new technical term you introduced to `docs/glossary.md` (Term | Discipline | Meaning | Where in this project).
8. No secrets anywhere. Phone number appears only inside the `wa.me` link, never as visible text.

## 1. Recon (read-only, before writing)
- Read `reference/prototype/README.md`, `src/App.jsx`, `src/styles.css`, `src/CubesBackground.jsx`, and every file in `src/rb/` (search for `MODIFIED`).
- Run `node -v` and `pnpm -v`; if pnpm is missing, enable it with `corepack enable pnpm`.
- Report anything in the prototype you think is a bug before porting it.

## 2. Locked decisions
| ID | Decision |
|---|---|
| D1 | Next.js (App Router, latest stable 16.x), TypeScript strict, `src/` dir, **fully static**: `output: 'export'`, `images.unoptimized: true`, `trailingSlash: true` |
| D2 | Tailwind CSS v4 (tokens in `@theme`) + plain CSS files that ship with React Bits components. GSAP (+ `@gsap/react`, ScrollTrigger, SplitText plugin) and Motion. Package manager: pnpm |
| D8 | Fixed full-screen glass cubes background (WebGL2): clear faces, accent-blue edges (alpha 0.22), ripple on click in empty space; pauses while About is pinned, when the tab is hidden, and under reduced motion; white page if WebGL2 is missing |
| D13 | One page: `#home` Hero · `#about` About · `#projects` Projects · `#contact` Contact · Footer. Extra routes: `/privacy`, 404 |
| D14 | Hero: label + title + description + "About me" button + "or book a free call" link; photo on the other side in a 24px rounded rectangle (no arch) |
| D15 | About: React Bits **CircularGallery**, pinned with ScrollTrigger, **snaps on each of the 4 photos** (0, ⅓, ⅔, 1), title at the bottom-middle of each photo, paragraph for the centred photo underneath (BlurText, replays on change), 4 progress dots. Same behaviour on desktop and mobile; horizontal drag/swipe also turns it; vertical wheel never trapped |
| D16 | Projects: two cards side by side (stacked on mobile), **identical frame size** (16:10): the client website in a light browser frame, Kubernetes autoscaling in a dark terminal frame, both wrapped in **GlareHover**; cards slide in from opposite sides |
| D17 | Contact: React Bits **FlowingMenu** with `alwaysOn` (bands always visible and moving, no hover needed), direction `alternate`, rows alternate **blue / transparent** (Email blue, WhatsApp clear, LinkedIn blue, GitHub clear, Book blue), round photo between repeats **spinning around its own centre** (20s/turn). Under it: a "Book a free call" panel with a placeholder where the Cal.com embed will go later |
| D18 | Nav: text only (About · Projects · Contact), no buttons/icons, active section underlined (scrollspy). Top bar on desktop, floating bottom pill on mobile (≤760px) |
| D19 | Footer: `© 2026 Mohammed Nehad` + `Privacy` link only. Floating round "go to top" arrow (the only icon) appears after the hero; on mobile it sits above the bottom nav and never covers Privacy |
| D20 | Text animations: label **DecryptedText**; H1 + section H2 **SplitText** (words); hero description + About paragraph **BlurText**; section intro lines **ScrollReveal**; "Let's talk." **VariableProximity**. Buttons: **StarBorder** (light theme, accent) inside **Magnet** + **ClickSpark** |
| Tokens | bg `#ffffff`, ink `#14171c`, muted `#535a65`, line `#e2e6eb`, accent `#1f5f8b`, accent-soft `#e9f1f7`. Fonts via `next/font/google`: **Bricolage Grotesque** (variable: `wght`, `opsz` axes — needed by VariableProximity) for display, **Instrument Sans** for body |
| Repo | Public GitHub repo `mohamednehad1570/portfolio` (Mohammed creates it). Branches: `main` = production, work on `feat/site-v1` |

## 3. Parts (one commit per part)

**Part 1 — Scaffold.** Create the Next.js app in the current folder (keep `reference/`). TypeScript strict, ESLint, Tailwind v4, `src/`, App Router, import alias `@/*`. Configure static export (D1). Add `.gitignore` (include `.env*`, `node_modules`, `out`, `.next`), `.env.example` (empty), `README.md` (what it is, how to run, how to build), `CLAUDE.md` (stack, rules from §0, folder map, gate commands), `docs/adr/0001-stack-and-static-hosting.md`, `docs/glossary.md`. Allow `.jsx` (vendored components) via `allowJs`.
*Check:* `pnpm dev` shows the default page; `pnpm build` produces `out/`.

**Part 2 — Vendor React Bits.** Copy these from `reference/prototype/src/rb/` into `src/components/rb/` (keep each component's CSS file next to it): CircularGallery, FlowingMenu, StarBorder, Magnet, ClickSpark, GlareHover, SplitText, BlurText, DecryptedText, ScrollReveal, VariableProximity. Add `src/components/rb/LICENSE-react-bits.md` (copy from the reference; React Bits is MIT + Commons Clause) and a `README.md` listing each component, its source (github.com/DavidHDev/react-bits) and what was modified. Every file gets `'use client'`. Do **not** add `@hugeicons/*`.
*Check:* the modifications below exist and are marked `MODIFIED`:
- CircularGallery: vertical wheel is ignored (only horizontal deltas turn it); engine exposes `goTo(index)`; new `activeIndex` prop drives it.
- FlowingMenu: Hugeicons removed; `alwaysOn` prop (every band visible, `clipPath: none`, marquee always running); per-row `bandColor` / `bandText`; `data-always` hides the static label visually (keep it for screen readers); round image spins (CSS `rotate`, 20s linear, off under reduced motion). **New:** pause the marquee loop when the menu is off-screen (IntersectionObserver).

**Part 3 — Cubes background.** Port `reference/prototype/src/CubesBackground.jsx` to `src/components/CubesBackground.tsx` (typed). Keep the rectangular grid, spacing 46px desktop / 34px mobile, pixel ratio capped at 2, pointer on `window`, ripples ignore clicks on links/buttons/gallery/menu, `paused` prop. Load it client-only (`next/dynamic`, `ssr: false`) so it never blocks the text.
*Check:* covers any window size, no layout shift, stops when paused or hidden.

**Part 4 — Design tokens and fonts.** `src/app/globals.css`: Tailwind v4 `@theme` with the tokens above, type scale from the prototype (`.h1`, `.h2`, `.h3`, `.lead`, `.body`, `.eyebrow`, `.todo`), focus style, reduced-motion rules. Fonts with `next/font/google` exposed as CSS variables `--font-display`, `--font-body`. Pass the display font family to CircularGallery's `font` prop and VariableProximity.
*Check:* no font loads from a runtime stylesheet link; text renders in both fonts.

**Part 5 — Content as data.** `src/content/site.ts` (typed, no JSX): hero texts; 4 About topics (`title`, `image`, `body`); 2 projects (`title`, `body`, `tags`, `href`, `frame: 'browser' | 'terminal'`, `address`); 5 contact rows (`label`, `marquee`, `href`, `band: 'blue' | 'clear'`). Copy the wording exactly from `reference/prototype/src/App.jsx`. Images live in `public/images/` (copy from `reference/prototype/public/img/`, rename to `hero.jpg`, `avatar.jpg`, `about-beyond.jpg`, `about-work.jpg`, `about-study.jpg`); missing photos keep the labelled placeholders.
*Check:* changing a sentence in `site.ts` changes the page; no copy is hard-coded in components.

**Part 6 — Sections.** Build `src/app/page.tsx` from server components, with client components only where needed:
- `Header` (scrollspy, D18), `Hero` (D14, D20), `About` (D15: `useGSAP` + ScrollTrigger pin, `end = innerHeight × 0.7 × (n−1)`, snap `1/(n−1)`, dots, cubes paused while pinned), `Projects` (D16, frames as `BrowserFrame` / `TerminalFrame` components), `Contact` (D17; mount FlowingMenu when the section is ~25% visible so its intro is seen; menu height 640px desktop / 460px mobile), `Footer` + `ToTop` (D19), shared `CtaButton` (StarBorder + Magnet + ClickSpark, renders an `<a>`), `Reveal` (enter-once fade/slide, respects reduced motion).
- External links: `target="_blank" rel="noopener noreferrer"`. The client website link stays `#projects` until the client approves showing it.
- Call `ScrollTrigger.refresh()` after fonts load.
*Check:* at 1440×900 and 390×844 the page matches the prototype; scrolling through About lands on all 4 photos in order; no horizontal scroll at any width.

**Part 7 — Privacy page and 404.** `/privacy`: headings only + short placeholder paragraphs in brackets for: who runs the site, what data is collected (booking: first name + email via Cal.com, later), cookieless analytics (later), how to ask for deletion, contact. `not-found.tsx`: one line + link home.
*Check:* both routes exist in `out/`.

**Part 8 — SEO basics.** `metadata` in `layout.tsx` (title, description, Open Graph using `hero.jpg`), `app/sitemap.ts` (home + privacy), `app/robots.ts`, JSON-LD `Person` with only confirmed facts (name, url placeholder, sameAs LinkedIn + GitHub). Set `metadataBase` from `NEXT_PUBLIC_SITE_URL` with a placeholder fallback and a TODO.

**Part 9 — Quality pass.** Heavy client components (`CircularGallery`, `FlowingMenu`, `CubesBackground`) loaded with `next/dynamic` and a static fallback. Reduced motion: no pin animation (show the 4 topics as a simple photo + text list instead), no marquee motion, no cubes motion. Keyboard: tab through nav, buttons, gallery, contact rows with visible focus.
*Check:* run the gates below; fix every error and warning.

## 4. Gates (run after every part)
```bash
pnpm exec tsc --noEmit   # type errors
pnpm lint                # ESLint
pnpm build               # static export into out/
```

## 5. Git
- `git init -b main`, first commit = Part 1 on `main`, then `git switch -c feat/site-v1` for Parts 2–9.
- One commit per part, Conventional Commits: `type(scope): description` (e.g. `feat(about): pinned circular gallery with snap`).
- Do **not** push. Mohammed will create the GitHub repo and push himself.
- Commit `reference/` too (it documents the approved design); exclude nothing else beyond `.gitignore`.

## 6. Report back
1. What changed per part (files) and commit hashes.
2. Gate results (pass/fail with counts).
3. Anything you could not do, bugs found in the prototype, and decisions needed.
4. The new glossary terms you added.
