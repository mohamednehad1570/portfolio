# ADR 0009: Domain at Spaceship, email on Proton Mail, hosting on Cloudflare

- Status: Accepted (decision D4, revised 2026-11-06). Supersedes the earlier plan to use Cloudflare Registrar and Cloudflare Email Routing for the domain and mailbox.
- Date: 2026-11-06
- Related: [0001](0001-stack-and-static-hosting.md) (static hosting), [0006](0006-contact-rings.md) (the Email ring), [0007](0007-booking-link-no-embed.md)

## Context
The domain is now registered, and the mailbox exists. The earlier plan assumed both would live at Cloudflare.

## Options considered
- **Cloudflare Registrar plus Email Routing (earlier plan):** one vendor, but Email Routing only forwards mail; it is not a mailbox Mohammed can send from.
- **Domain and DNS at Spaceship, hosting elsewhere:** works, but splits DNS from the host and loses Cloudflare's edge settings.
- **Domain registered at Spaceship, DNS and hosting at Cloudflare, mail on Proton (chosen).**

## Decision
- Domain: **mohammednehad.com**, registered at **Spaceship**.
- Email: **Proton Mail**, address **hello@mohammednehad.com** (one constant, `CONTACT_EMAIL` in `src/content/site.ts`).
- Hosting stays Cloudflare (see 0001). The public site address is `https://mohammednehad.com`, the fallback of `NEXT_PUBLIC_SITE_URL`.
- DNS will move to Cloudflare in batch 3. That move **must copy Proton's mail records** (MX, SPF, DKIM, DMARC) exactly, or mail stops arriving. This batch does not touch DNS.

## Consequences
- The Email ring becomes a real `mailto:` link, and the privacy page's contact placeholder uses the same address.
- Canonical URLs, Open Graph, the sitemap, robots.txt and the structured data now point at mohammednehad.com.
- Registrar and mail vendor are separate from the host; transferring the domain or changing mail later does not affect the site code except `CONTACT_EMAIL`.
