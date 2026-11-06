# ADR 0011: About rest-then-move pacing, heading inside the pin; booking links become buttons

- Status: Accepted (decisions D15 amended, D6 / D14 amended, 2026-11-07, approved on samples). Amends the pacing and header placement of [0010](0010-about-sideways-stack.md) and the link style of [0007](0007-booking-link-no-embed.md).
- Date: 2026-11-07
- Related: [0005](0005-text-animation-system.md), [0007](0007-booking-link-no-embed.md), [0008](0008-about-scroll-pacing-and-replay.md), [0010](0010-about-sideways-stack.md)

## Context
With 0010's even pacing (`STEP = 0.6`) a topic is always on the move: the visitor never gets a still moment to read it. Clicking "About" also landed above the pin, with the heading on its own and a blank band before the slides. Separately, "Book a free call" was a small text link next to the buttons in the Hero and in Projects, easy to miss, while it is the main offer.

## Options considered
- **Keep even pacing:** simple, but the text is always moving while it is read.
- **Snap to each topic:** breaks native scrolling (`CLAUDE.md` rule 9). Rejected.
- **Rest-then-move pacing (chosen):** each topic gets a still stretch of scroll, then the next slides in with an eased move. Scrolling stays native and continuous; only the mapping from scroll position to sideways position changes.
- **Booking: an attention animation on the text link** (rejected on samples) **or a real button (chosen).**

## Decision
- **Pacing:** each topic segment is `SEG = REST + MOVE` viewport heights, `REST = 0.55`, `MOVE = 0.45` (replaces `STEP = 0.6`).
  `sv = max(0, scrollY − pinTop) / viewH`; `k = min(3, floor(sv / SEG))`; `within = sv − k × SEG`;
  `x = k` while `within < REST`, otherwise `x = k + smoothstep((within − REST) / MOVE)`; `x = 3` once `k = 3`.
  Pin height = `viewH + 3 × SEG × viewH + (REST + HOLD) × viewH`, `HOLD = 0.3`: the last topic keeps a rest plus the hold before the section releases. Front-topic hysteresis (0.55) and the text replay are unchanged and still follow `x`.
- **Heading inside the pin:** the About eyebrow and H2 sit in the sticky stage, directly above the slides (text system of 0005 unchanged). The pin itself carries the `#about` id and `scroll-margin-top` = header height, so a nav click lands exactly on the pin start: heading and topic 1 fill the screen. Desktop and tablet centre heading, slides and dots vertically; phones align them to the top and keep the bottom clear of the nav pill.
- **Reduced motion and no JavaScript:** unchanged plain list, heading on top.
- **Booking buttons:** in the Hero and in Projects, "Book a free call" is a `CtaButton` (StarBorder + Magnet + ClickSpark, same behaviour as the other buttons) next to the existing one; no attention animation. Every booking link (Hero, Projects, Contact ring 5) opens in a new tab (`target="_blank" rel="noopener noreferrer"`) only when `BOOKING_URL` is an external URL; while it is the `#contact` placeholder it stays in the page.

## Consequences
- `STEP` is gone from `AboutSideways.tsx` and the CSS; `REST`, `MOVE`, `HOLD` are written to the pin as custom properties so the CSS pin height and the progress maths share one source.
- Arrival to arrival is now 1.0 × viewH (was 0.6), so the About is longer to scroll through; each topic is still for 0.55 × viewH of it.
- Once batch 4 sets the real Cal.com URL, all three booking links open Cal.com in a new tab with no further change.
