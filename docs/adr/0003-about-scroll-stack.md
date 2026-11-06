# ADR 0003: About as a transparent native scroll stack

- Status: Accepted (decision D15, revised). Supersedes the React Bits `CircularGallery` pinned About (D15 as first built in batch 1).
- Date: 2026-11-06
- Superseded by [0010](0010-about-sideways-stack.md) (a sideways stack on every screen size). Earlier note: amended by [0008](0008-about-scroll-pacing-and-replay.md): scroll pacing, a last photo that lands and holds, and a text reveal that replays.
- Related: [0001](0001-stack-and-static-hosting.md), [0002](0002-night-sky-background.md) (the stars show through), [0004](0004-dark-theme.md)

## Context
The batch 1 About pinned the screen, snapped the page to four stops and turned a WebGL carousel. That meant scroll pinning and snapping (a form of scroll hijacking), a WebGL context, progress dots and a "hint" line explaining how to drive it. It was also the reason the old background had to pause. The page should scroll normally everywhere.

## Options considered
- **React Bits CircularGallery (current):** striking, but WebGL, pinned, snapped, needs a hint and dots.
- **Sticky photo:** one photo stays while the text changes. Simple, but only one image is ever visible.
- **Chapter index:** a list of the four topics that opens one at a time. Accessible, but static and unrelated to scrolling.
- **React Bits ScrollStack:** the right look, but it uses Lenis inside its own scroll box, which captures the wheel and breaks native scrolling. Rejected.
- **Native scroll stack (chosen):** each topic is a `position: sticky` item; older items shrink and dim as newer ones arrive. Scroll position drives it through GSAP ScrollTrigger.

## Decision
`AboutStack` (in `src/components/sections/`): four transparent sticky items (no background, border, radius or shadow on the item), photo left and text right on desktop, photo above text on tablet and phone. The scrubbed "depth" effect (scale, photo brightness, text opacity) uses transforms and opacity only. Each topic's text reveals word by word once, when its photo arrives. Reduced motion shows a plain list.

## Consequences
- Rule added to `CLAUDE.md`: **native scrolling only**: no Lenis or other smooth-scroll library, no element that captures the mouse wheel, no inner scroll boxes.
- The ScrollTrigger pin, snap, progress dots and the `hint` and `dotsAriaLabel` copy are removed.
- `CircularGallery` is deleted; no package is removed because it used none (it was raw WebGL).
- Decided later (0008): the text replays each time a photo comes to the front.
