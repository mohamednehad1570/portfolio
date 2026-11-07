# ADR 0015: About becomes a drag / tap card stack

- Status: Accepted (batch 7 brief from Mohammed, 2026-11-07). Supersedes [0010](0010-about-sideways-stack.md) and [0014](0014-about-focus-swipe-dots.md), and the About pacing of [0008](0008-about-scroll-pacing-and-replay.md) and [0011](0011-about-rest-pacing-and-booking-buttons.md).
- Context: the scroll-driven sideways stack needed a pin, pacing maths, an idle settle and a swipe handler just to stay readable, and it still made About long to scroll past.
- Decision: About is a normal section with normal page scrolling (no pin, no sticky stage, no scroll listeners). The four photos are a React Bits **Stack** (`src/components/rb/Stack.tsx`, fan layout). Drag, flick or tap the top card, use the ‹ › buttons or the dots, or the arrow keys on the focused stack. The extension adds a ref API with `next` / `prev` / `goTo`.
  - The text panel follows the top card. All four blocks share one grid cell (only the active one is visible), so nothing shifts, and the words replay with WordReveal.
  - Screen readers get one plain list of all topics.
  - Without JavaScript, the same list is shown with photos. Under reduced motion the stack stays and uses short fades.
  - The top card has `touch-action: pan-y`: a finger on the photo still scrolls the page.
  - The section has `overflow-x: clip`, so a card flying out never causes sideways scroll.
- Consequences: rule 9 no longer needs an About exception (no settle, no swipe on scroll). `AboutSideways.tsx`, its CSS and the "hide go-to-top while pinned" rule are gone. The topic order follows the photos: Who I am, Study, Experience and work, Beyond work.
