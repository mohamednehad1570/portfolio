# ADR 0007: Booking is a link, not an embedded calendar

- Status: Accepted (decision D6, amended). Amends the "booking widget will be added as a client-side embed" note in [0001](0001-stack-and-static-hosting.md).
- Date: 2026-11-06
- Related: [0006](0006-contact-rings.md)

## Context
The first plan put a Cal.com calendar embed on the page in a "Book a free call" panel. An embed loads a third-party script and iframe on every visit, adds weight, and needs consent wording on the privacy page before it can load.

## Options considered
- **Embed the calendar in a panel (original D6):** one page, but third-party code on every visit.
- **Load the embed only after a click:** better, but still a panel to design, test and keep in step with Cal.com.
- **Link to the Cal.com event page (chosen):** one constant, no third-party code on this site.

## Decision
No booking embed and no "Book a free call" panel. Every "Book a free call" link (hero, Projects, Contact ring 5) points to one constant, `BOOKING_URL` in `src/content/site.ts`. Until the Cal.com event exists it is `#contact`, marked `TODO(batch-4): Cal.com event URL`. The call itself (30 minutes, free, no pressure) is described in the Contact intro line and, later, on the Cal.com event page.

## Consequences
- The page loads no booking script; the privacy page only has to mention Cal.com as the place a visitor goes to after clicking.
- Changing the booking tool later means changing one constant.
- Batch 4 replaces the placeholder with the real event URL.
