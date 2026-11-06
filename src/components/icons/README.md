# Icons: sources and notes

Small inline logos for the Contact rings. No icon library is used. Brand marks remain the trademarks of their owners
(see ADR 0006 on showing and rotating logos).

| File | What | Source | Changes |
|---|---|---|---|
| `GitHubIcon.tsx` | GitHub mark | Simple Icons, `icons/github.svg`, https://github.com/simple-icons/simple-icons (path data is CC0) | none (path copied unchanged) |
| `WhatsAppIcon.tsx` | WhatsApp mark | Simple Icons, `icons/whatsapp.svg`, same repository | none (path copied unchanged) |
| `EnvelopeOpenIcon.tsx` | open envelope | drawn for this site | n/a |
| `CalendarIcon.tsx` | calendar | drawn for this site | n/a |
| `LinkedInIcon.tsx` + `linkedin-in-white.webp` | LinkedIn "in" logo, white | LinkedIn brand resources, https://brand.linkedin.com/in-logo, file `InBug-White.png` from `in-logo.zip` (https://content.linkedin.com/content/dam/me/business/en-us/amp/xbu/linkedin-revised-brand-guidelines/logos/in-logo.zip), downloaded 2026-11-06 | scaled only: 840 x 779 px down to 140 x 130 px (same proportions, Lanczos), saved as lossless WebP (1.3 KB). No recolouring, cropping or redrawing. |

## LinkedIn notes
- Simple Icons no longer includes LinkedIn, and LinkedIn publishes its logo as PNG only, so this one is an image, not an inline SVG.
- 140 px wide is about 2x the largest size it is shown at (the centre 34% of a 184 px ring, about 63 px), so it stays sharp on high-density screens.
- Original file checksum (MD5): `933375fd56532e378d23db0e60f7c792`. Use the logo as LinkedIn's brand guidelines describe; do not alter it.
- Rotating the logo is the site owner's choice (ADR 0006); LinkedIn's guidelines generally ask for logos to be left upright.
