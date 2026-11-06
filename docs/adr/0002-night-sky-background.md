# ADR 0002: Night-sky background (Canvas 2D constellations)

- Status: Accepted (decision D8, revised). Supersedes the WebGL2 glass-cubes background (D8 as first built in batch 1).
- Date: 2026-11-06
- Related: [0001](0001-stack-and-static-hosting.md) (stack), [0003](0003-about-scroll-stack.md) (About), [0004](0004-dark-theme.md) (dark theme, which this background needs)

## Context
Batch 1 shipped a fixed WebGL2 field of clear glass cubes as the site's signature visual. It needs WebGL2, must be paused while the About section is pinned (both fight for the GPU), and sits on a white page. The new dark theme (0004) calls for a quieter, cheaper background that works on any device. Four samples were compared and approved on 2026-11-06.

## Options considered
- **A1, plain stars:** twinkling dots only. Cheapest, but nothing reacts to the visitor.
- **A2, stars and shooting stars:** adds meteor streaks, still no interaction.
- **A3, constellation night:** stars, fixed constellation lines, links that appear around the cursor or a tap, and rare shooting stars. Canvas 2D.
- **B, keep the glass cubes (restyled for dark):** keeps WebGL2 and the pause logic; heavier and needs a fallback.

## Decision
**A3 "Constellation night".** One fixed full-screen `<canvas>` (Canvas 2D) behind all sections, `aria-hidden`, loaded client-only after the main content. Exact numbers (star density, link distances, shooting-star timing) are in the build prompt of batch 1b and in the header comment of `StarfieldBackground.tsx`. Reduced motion draws one static frame. The loop stops when the tab is hidden. If the canvas fails, the plain `#0a1626` page shows.

## Consequences
- `CubesBackground.tsx`, `CubesLayer.tsx` and the "pause background while About is pinned" state are removed. No WebGL is needed for the background.
- Pointer and tap interaction replaces the old click ripple. The canvas never captures input (`pointer-events: none`; events are read on `window`).
- Cost: a 2D canvas redraw per frame (a few hundred arcs and lines), far below the cubes' GPU load.
- Glossary gets the new graphics terms; the old cube/shader terms are removed.
