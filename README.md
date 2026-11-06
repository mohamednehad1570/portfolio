# Mohammed Nehad: portfolio and web-development services site

One-page portfolio for Mohammed Nehad (web developer, Cairo, working worldwide): Hero, About, Projects, Contact, plus `/privacy`.
Fully static (Next.js static export), no tracking, no cookies.

The approved visual prototype (Vite) lives in `reference/prototype/`; it documents the design but is not part of the build.

## Run it

Requires Node 22+ and pnpm (`corepack enable pnpm`).

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

## Build it

```bash
pnpm exec tsc --noEmit   # type check
pnpm lint                # ESLint
pnpm build               # static export into out/
```

`out/` is plain HTML/CSS/JS; any static host can serve it.

## Deploy

Live at **https://mohammednehad.com**, hosted on Cloudflare Workers static assets (ADR 0012).

- **Automatic:** Cloudflare Workers Builds watches this GitHub repo. A push to `main` runs `pnpm build` and `wrangler deploy` (the live site). A push to any other branch builds a preview version with its own `*.workers.dev` URL (not indexed by search engines).
- **Config:** `wrangler.jsonc` (what to serve and on which domains) and `public/_headers` (security and cache headers).
- **Manual deploy** (rarely needed): `pnpm exec wrangler login`, then `pnpm build && pnpm exec wrangler deploy`.
- **Local check of the production setup:** `pnpm build && pnpm exec wrangler dev` (serves `out/` with the same headers and 404 handling).
- **Rollback:** Cloudflare dashboard → Workers & Pages → `mohammednehad` → Deployments → redeploy an earlier version; or `git revert` the commit and push to `main`.

## More

- `CLAUDE.md`: stack, rules and folder map (read first when working on the project)
- `docs/adr/`: architecture decisions
- `docs/glossary.md`: technical terms used in the project
