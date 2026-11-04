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
| WebGL2 | Graphics | Browser API for drawing hardware-accelerated 2D/3D graphics on a canvas | `CubesBackground.tsx`, `CircularGallery.jsx` |
| Shader (vertex / fragment) | Graphics | Small GPU programs: the vertex shader positions each corner, the fragment shader colours each pixel | `CubesBackground.tsx` |
| Instanced rendering | Graphics | Drawing many copies of one mesh in a single GPU call, each with its own data (here: one cube per grid cell) | `CubesBackground.tsx` (`drawElementsInstanced`) |
| Quaternion | Maths / graphics | Four-number way to store a 3D rotation without gimbal lock | `CubesBackground.tsx` (cube tilt) |
| Orthographic projection | Graphics | Projection with no perspective: parallel lines stay parallel, so the grid looks flat | `CubesBackground.tsx` (`uM` matrix) |
| devicePixelRatio | Browser API | How many real screen pixels make one CSS pixel; capped at 2 to save GPU work | `CubesBackground.tsx` |
| Spring simulation | Animation | Motion where a value is pulled toward a target with stiffness and damping, so it overshoots and settles | `CubesBackground.tsx` (`step`) |
| `next/dynamic` | Frontend framework | Loads a component as a separate JavaScript chunk, on demand | `CubesLayer.tsx` |
| `ssr: false` | Frontend framework | Skips rendering a component on the server/at build time; it exists only in the browser | `CubesLayer.tsx` |
| Layout shift | Performance | Content jumping when something loads late; the canvas is `position: fixed` so it causes none | `CubesBackground.tsx` |
| Decorative (`aria-hidden`) | Accessibility | Marks an element as invisible to screen readers because it carries no information | `CubesBackground.tsx` |
| Design tokens | Design systems | Named design values (colours, fonts) defined once and reused everywhere | `src/app/globals.css` (`@theme`) |
| `@theme` | Styling (Tailwind v4) | Tailwind v4 block where tokens are declared; each becomes a CSS variable and a utility class | `src/app/globals.css` |
| `next/font` | Performance | Next.js tool that downloads Google Fonts at build time and self-hosts them, so no request goes to Google at runtime | `src/app/layout.tsx` |
| Variable font | Typography | One font file containing a range of weights/widths/sizes, selected by axes (`wght`, `opsz`) | Bricolage Grotesque in `layout.tsx` |
| Optical size (`opsz`) | Typography | Font axis that adjusts letter shapes for small or large text | `layout.tsx`, `VariableProximity` |
| `font-display: swap` | Performance | Shows fallback text immediately and swaps to the web font when it loads | `layout.tsx` |
| Focus-visible | Accessibility | CSS state for elements focused by keyboard; used for the visible focus ring | `globals.css` |
| `prefers-reduced-motion` | Accessibility | OS setting that asks sites to avoid animation | `globals.css`, components |
| Cascade layer (`@layer`) | Styling | CSS grouping that decides which rules win regardless of order | `globals.css` (`components` layer) |
| `satisfies` | TypeScript | Checks a value against a type without widening the value's own type | `src/content/site.ts` |
| Content as data | Architecture | Page copy kept in typed data files, separate from components | `src/content/site.ts` |
| `wa.me` link | Messaging | WhatsApp's click-to-chat URL; the phone number lives only inside it, never as visible text | `src/content/site.ts` (WhatsApp row) |
