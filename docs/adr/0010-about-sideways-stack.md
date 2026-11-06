# ADR 0010: About as a scroll-driven sideways stack on every screen size

- Status: Accepted (decision D15, revised 2026-11-06, approved on samples as "About options (3B)"). Pacing and heading placement amended by [0011](0011-about-rest-pacing-and-booking-buttons.md). Supersedes the vertical sticky stack of [0003](0003-about-scroll-stack.md) and the vertical pacing of [0008](0008-about-scroll-pacing-and-replay.md). Keeps 0008's `STEP`, `HOLD` and replay.
- Date: 2026-11-06
- Related: [0003](0003-about-scroll-stack.md), [0005](0005-text-animation-system.md), [0008](0008-about-scroll-pacing-and-replay.md)

## Context
The vertical stack (0003, 0008) works, but the photos pile up under each other and, on phones and tablets, the cards are tall and crowded. The approved sample 3B moves the topics sideways instead, on every screen size, while the visitor still scrolls only downwards.

## Options considered
- **Keep the vertical stack:** works and is already built, but is the look that was replaced on samples.
- **Real horizontal scrolling (a sideways scroll area):** would capture the wheel or need sideways swipes, which breaks native scrolling (`CLAUDE.md` rule 9). Rejected.
- **Pinned stage driven by vertical scroll progress (chosen):** the section sticks to the screen with CSS `position: sticky`; normal vertical scrolling moves a progress value, and the progress moves the topics sideways. Sideways trackpad swipes do nothing.

## Decision
- **Structure:** the header (eyebrow and H2) stays in normal flow. Below it, a pin container of height `viewH + 3 × STEP × viewH + HOLD × viewH`, holding a sticky stage (`top` = header height, height `viewH`, `overflow: hidden`) with the four topic slides on top of each other and the progress dots. `viewH` is the viewport height minus the sticky header (desktop and tablet) or the full height (phones, where the nav is a bottom pill).
- **Progress:** `p = clamp((scrollY − pinStart) / (3 × STEP × viewH), 0, 1)`, `x = 3p`. `STEP = 0.6`, `HOLD = 0.3` (the same constants as 0008).
- **Motion, per slide with `d = i − x`:** ahead or in front (`d ≥ 0`): it waits just off the right edge and slides in over the current one. Passed (`d < 0`, `depth = min(−d, 3)`): it steps left by `depth × 22 px` (10 px on phones), shrinks by 5% per depth about its left edge, its photo dims by 25% per depth, and its text fades out (`1 − 1.6 × depth`), so texts never overlap. Only transforms, filter and opacity change while scrolling.
- **Replay:** the front topic changes at `x − front ≥ 0.55` going forward and `front − x ≥ 0.55` going back (hysteresis); each time a topic becomes front its words play again. Topic 1 plays when the pin first reaches the top of the viewport.
- **Dots:** four decorative progress dots under the stage, aligned with the slide's left edge.
- **Reduced motion and no JavaScript:** no pin; the four topics are a plain vertical list, all visible.

## Consequences
- `AboutStack.tsx` and its CSS are removed; `sections/AboutSideways.tsx` replaces them. `WordReveal` is kept unchanged.
- The `CLAUDE.md` rule stays: native scrolling only, no snapping, no wheel or touch capture. The sideways movement is only a picture of the vertical scroll position.
