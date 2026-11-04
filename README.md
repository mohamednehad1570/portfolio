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

## More

- `CLAUDE.md`: stack, rules and folder map (read first when working on the project)
- `docs/adr/`: architecture decisions
- `docs/glossary.md`: technical terms used in the project
