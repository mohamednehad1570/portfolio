# ADR 0001: Stack and static hosting

- Status: Accepted (decisions D1, D2 of build batch 1)
- Date: 2026-11-04

## Context
The site is a one-page portfolio with no user accounts, no database and no server-side logic. Visitors come from all over the world. It must be fast, cheap (free where possible), safe (nothing to attack on the server) and easy to host anywhere.

## Decision
- Next.js (App Router, latest stable 16.x) with TypeScript strict, configured as a **fully static export**: `output: 'export'`, `images.unoptimized: true`, `trailingSlash: true`. `next build` writes plain files into `out/`.
- Tailwind CSS v4 for tokens and utilities, plus the plain CSS files that ship with React Bits components. GSAP and Motion for animation. pnpm as package manager.
- Free / open-source tools only; no tracking, no cookies.

## Consequences
- Any static host works (Cloudflare, GitHub Pages, Netlify); the host choice is a separate decision (D3, settled in [0012](0012-hosting-cloudflare-workers.md): Cloudflare Workers static assets).
- No server features: no API routes, no middleware, no Next image optimiser, no `cacheComponents`. Photos are pre-sized in `public/images/`.
- Analytics will be added later as a client-side script. The booking calendar is a link to Cal.com, not an embed (amended by [0007](0007-booking-link-no-embed.md)).
- `trailingSlash: true` makes `/privacy` build to `out/privacy/index.html`, which works on hosts without rewrite rules.

## Alternatives considered
- Astro: smaller JS by default, but the approved prototype and the React Bits components are React; Next.js keeps one stack with the existing project for a UAE manufacturer client.
- Server-rendered Next.js: unnecessary for a static page and would need a Node host.
