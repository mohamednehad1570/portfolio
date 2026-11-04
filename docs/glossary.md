# Glossary

Technical terms used in this project. Columns: Term | Discipline | Meaning | Where in this project.

| Term | Discipline | Meaning | Where in this project |
|---|---|---|---|
| Static export | Web architecture | `next build` produces plain HTML/CSS/JS files with no server needed | `next.config.ts` (`output: 'export'`), `out/` |
| App Router | Frontend framework | Next.js routing where folders under `src/app/` are URLs | `src/app/` |
| Trailing slash | Web architecture | URLs end with `/`, so `/privacy/` maps to `privacy/index.html` on any static host | `next.config.ts` (`trailingSlash`) |
| ESLint | Code quality | Tool that flags likely bugs and style problems in code | `eslint.config.mjs`, `pnpm lint` |
| Type checking (tsc) | Code quality | TypeScript compiler run without output, to find type errors | `pnpm exec tsc --noEmit` |
| ADR | Architecture | Architecture Decision Record: a short note of one decision, why, and what follows | `docs/adr/` |
| pnpm | Tooling | Package manager that stores each dependency once on disk and links it | `package.json`, `pnpm-lock.yaml` |
| Corepack | Tooling | Node's built-in switch that provides pnpm/yarn at the pinned version | `corepack enable pnpm` |
| Conventional Commits | Version control | Commit message format `type(scope): description` | Git history |
| Vendoring | Dependency management | Copying third-party source into your own repo (instead of installing it) so you can edit it | `src/components/rb/` |
| React Bits | Frontend components | Open-source library of animated React components (MIT + Commons Clause) | `src/components/rb/` |
| Commons Clause | Licensing | Licence add-on: you may use the code commercially but not sell or redistribute the components themselves | `src/components/rb/LICENSE-react-bits.md` |
| `'use client'` | Frontend framework | Marks a file as a Client Component that runs in the browser (needed for effects, events, browser APIs) | first line of every file in `src/components/rb/` |
| Client Component | Frontend framework | React component that is hydrated and runs in the browser, as opposed to a server component that only renders HTML at build time | `src/components/rb/`, interactive sections |
| IntersectionObserver | Browser API | Tells you when an element enters or leaves the visible screen area, without polling scroll position | `FlowingMenu.jsx` (pauses the marquee off-screen) |
| Marquee | UI pattern | Text strip that scrolls endlessly in one direction | `FlowingMenu` bands |
| requestAnimationFrame | Browser API | Runs a function before the next screen repaint; the standard way to drive animation loops | `FlowingMenu.jsx`, `CircularGallery.jsx` |
| ESLint override | Code quality | Config block that changes lint rules for chosen files only | `eslint.config.mjs` (rule relaxations for `src/components/rb/`) |
| React Compiler lint rules | Code quality | `react-hooks` checks (refs, purity) that assume code is compiler-safe; flag patterns vendored components use on purpose | `eslint.config.mjs` |
