# ADR 0006: Contact as five rotating text rings

- Status: Accepted (decision D17, revised). Supersedes the React Bits FlowingMenu Contact (D17 as first built in batches 1 and 1b).
- Date: 2026-11-06
- Amended 2026-11-06 (batch 1d): the order is now Email, WhatsApp, Book a free call, LinkedIn, GitHub.
- Related: [0004](0004-dark-theme.md) (its Contact band colours no longer apply), [0005](0005-text-animation-system.md), [0007](0007-booking-link-no-embed.md)

## Context
The FlowingMenu was a tall block of five full-width bands with moving marquees and a spinning photo. It filled the page with coloured bars, hid the stars, needed JavaScript to be reachable by keyboard (a defect fixed in batch 1b) and repeated the avatar five times.

## Options considered
- **Keep FlowingMenu:** works, but heavy and visually unrelated to the night sky.
- **Plain icon buttons:** simple and quiet, but no character.
- **Five CircularText rings in one line (chosen):** each ring is a link, with the service logo at its centre.

## Decision
Five rings in one line, no rows and no backgrounds (the stars show through). Each ring is one link. Neighbouring rings spin in opposite directions. Each ring's centre holds the service logo, white, **counter-rotating**: it turns at the ring's speed but the opposite way, so ring and logo always spin against each other (the logo does not stay upright while motion is on). No names under the rings; the accessible name is the link's `aria-label`. Order (amended in batch 1d, decision D17): **Email, WhatsApp, Book a free call, LinkedIn, GitHub**, so the booking ring sits in the middle (on phones the 3 + 2 wrap keeps it centred in the top row). Spin direction and text colour follow the position, not the ring: 1 clockwise / ink, 2 counter-clockwise / accent, 3 clockwise / ink, 4 counter-clockwise / accent, 5 clockwise / ink. Sizes: 184 px (desktop), about 140 px (tablet), 104 px (phone, wrapped 3 + 2). Reduced motion: no spin, no tilt, logos upright.

## Consequences
- **Logos are not decorative branding of ours.** They are shown white and otherwise unmodified; the marks stay their owners' trademarks. Brand guidelines of most companies discourage rotating or recolouring their logos. The counter-rotation is the owner's choice and the trade-off is accepted. If a company objects, the logo comes out and the ring text stays.
- GitHub and WhatsApp paths come from Simple Icons (CC0 data). LinkedIn comes from LinkedIn's own brand resources: the official white "in" logo, unmodified except for scaling, as a lossless WebP (LinkedIn offers PNG only). Sources are listed in `src/components/icons/README.md`.
- The `accent-strong` colour token and `ACCENT_STRONG` constant (used only by the Contact bands) are removed with the bands.
- FlowingMenu, the avatar used only by it, the "contact seen" state and the Tab-press workaround in `SiteState` are removed.
