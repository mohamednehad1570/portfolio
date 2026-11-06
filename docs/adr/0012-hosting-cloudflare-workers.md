# ADR 0012: Hosting on Cloudflare Workers static assets, deployed by Workers Builds

- Status: Accepted (decisions D3 and D4, 2026-11-07). Settles the host choice left open in [0001](0001-stack-and-static-hosting.md) ("D3, still pending") and carries out the hosting part of [0009](0009-domain-and-email.md).
- Date: 2026-11-07
- Related: [0001](0001-stack-and-static-hosting.md), [0009](0009-domain-and-email.md)

## Context
The site is a static export (`out/`: HTML, CSS, JS, images). The domain's DNS already runs on Cloudflare, with Proton Mail's records in the same zone. We need a host that is free, fast worldwide, deploys from GitHub without storing secrets there, and lets us set security headers.

## Options considered
- **GitHub Pages:** free and simple, but no custom response headers (no CSP, HSTS control) and a separate DNS setup.
- **Cloudflare Pages:** also free, but Cloudflare now points new projects to Workers; new platform features land there first.
- **Cloudflare Workers static assets (chosen):** free plan, served from Cloudflare's edge next to the DNS we already use, headers from a `_headers` file, Git-connected builds with per-branch preview URLs. No Worker script is needed: requests for static files are free and do not count against Worker invocations.

## Decision
- **Serving:** `wrangler.jsonc` points `assets.directory` at `./out`. Unknown paths get our `404.html` with a real 404 status (`not_found_handling: "404-page"`); `/privacy/` style folder pages keep their trailing slash (`html_handling: "auto-trailing-slash"`).
- **Domains:** canonical address `https://mohammednehad.com` (no www). Both `mohammednehad.com` and `www.mohammednehad.com` are Workers *Custom Domains*: Cloudflare creates the proxied DNS records and the TLS certificates itself. A Cloudflare **Redirect Rule** sends `www` to the apex with a 301, keeping path and query string.
- **Deploys:** Cloudflare **Workers Builds** is connected to `mohamednehad1570/portfolio`. Each push to `main` runs `pnpm build` and `wrangler deploy` (production); pushes to other branches upload a preview version with its own `*.workers.dev` preview URL. Cloudflare holds its own deploy token; no API token is stored in GitHub. `wrangler` is a devDependency so local and CI deploys use the same pinned version. The first deploy was done once by hand (`wrangler deploy` after `wrangler login`).
- **Headers** (`public/_headers`, copied to `out/_headers` by the build): `nosniff`, `strict-origin-when-cross-origin` referrer, `X-Frame-Options: DENY` plus CSP `frame-ancestors 'none'`, a Permissions-Policy that turns off camera, microphone, geolocation, payment and USB, `Cross-Origin-Opener-Policy: same-origin`, HSTS for one year with subdomains (no `preload` yet), and a Content-Security-Policy limited to this origin. Files under `/_next/static/` have content hashes in their names, so they are cached for a year as `immutable`. All `*.workers.dev` URLs (production and preview) send `X-Robots-Tag: noindex`, so search engines only index the real domain.
- **Cost:** $0 (Workers free plan; static asset requests are free and unlimited).
- **Rollback:** in the Cloudflare dashboard (Worker → Deployments) redeploy a previous version, or `git revert` the bad commit and push to `main`.

## Consequences
- The CSP needs `'unsafe-inline'` for scripts and styles: the static export writes inline scripts (Next.js bootstrap data, the `js` class script) and inline styles. **Later hardening:** a hash-based CSP (hash each inline script at build time) to drop `'unsafe-inline'` from `script-src`.
- HSTS `includeSubDomains` means every subdomain must be served over HTTPS from now on. `preload` is left out until the setup has run for a while, because leaving the preload list is slow.
- Changing the host later means replacing `wrangler.jsonc` and `_headers`; the site code does not change.
- DNS records for the site are owned by the Custom Domains; Proton's mail records are not touched and must never be.
