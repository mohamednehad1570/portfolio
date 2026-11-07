# ADR 0014: About focus — slower pacing, idle settle, touch swipe, tappable dots, no numbers

- Status: Accepted (batch 6 brief from Mohammed, 2026-11-07; pending his test on the preview). Amends [0010](0010-about-sideways-stack.md) ("no snapping", "sideways swipes do nothing", decorative dots) and the pacing of [0011](0011-about-rest-pacing-and-booking-buttons.md); amends `CLAUDE.md` rule 9 for the About section only.
- Date: 2026-11-07
- Related: [0003](0003-about-scroll-stack.md), [0005](0005-text-animation-system.md), [0008](0008-about-scroll-pacing-and-replay.md), [0010](0010-about-sideways-stack.md), [0011](0011-about-rest-pacing-and-booking-buttons.md)

## Context
The sideways stack moves only with vertical scroll. Visitors who stop scrolling halfway through a move are left looking at two topics overlapping. On phones, people instinctively swipe sideways at something that moves sideways, and nothing happens. The progress dots look like controls but are not. The "01 / 04" line above each title is noise. And at one viewport height per topic, the text arrives and leaves a little too fast to read comfortably.

## Rule 9, amended for About only
Scroll stays native and the visitor always stays in control. **Allowed in About:** a soft settle (only after the visitor has stopped), a sideways swipe on touch screens, and tappable dots. **Still not allowed anywhere:** scroll-jacking, mandatory snapping, wheel capture, `preventDefault` on vertical scroll, inner scroll boxes, Lenis, any trap. The visitor must always be able to scroll straight past About with mouse, trackpad, keyboard and touch.

## Options considered (the settle)
- **Native CSS proximity snapping (`scroll-snap-type: y proximity`, zero-height markers at the settle points, on the root only in motion mode).** The brief's preferred method, so it was built and tested first. **Rejected after testing:** in Chrome (1440 × 900), a mouse wheel turned one notch every 150 ms was pulled back to the first topic's settle point after every notch and never got past About (400 notches, 124 backward jumps). Chrome also re-snaps after programmatic scrolls, so the dot and swipe tweens would have had to switch snapping off and on. That breaks the "never trap, never fight" rule.
- **JS idle settle (chosen, the brief's fallback).**
- **No settle:** simplest, but leaves half-moved stages.

## Decision
- **Pacing:** each topic owns `SEG = REST + MOVE = 0.75 + 0.45 = 1.2` viewport heights of scroll (was `0.55 + 0.45`). `HOLD = 0.3` is unchanged, and the last topic keeps `REST + HOLD`. The same formulas (0011) apply: pin height `= viewH × (1 + 3 × SEG + REST + HOLD)`, recalculated on every resize/refresh. Smoothstep easing, slide-in from the right, the depth effect and the text replay with hysteresis are unchanged.
- **Settle point** of topic `i`: the middle of its REST, `scrollY = pinStart + (i × SEG + REST / 2) × viewH`.
- **Idle settle:** it runs after 200 ms with no scrolling, and only when:
  - no finger or mouse button is down;
  - no in-page link scroll (nav, go-to-top) has just run;
  - the page is inside the pin;
  - topic progress `x` is mid-move but within 0.35 of a whole topic;
  - and that topic lies in the visitor's direction of travel.

  It then eases (ease-out cubic, 450 ms, `requestAnimationFrame` + `window.scrollTo`) to that topic's settle point. Any `wheel`, `touchstart`, `pointerdown` or `keydown` stops it instantly. Every listener is passive.
  - **Direction rule (an addition to the brief):** the settle never pulls the visitor back against the way they were scrolling. Without it, a slow wheel (one notch, a pause, one notch) is pulled back after every notch that starts a move, which is the same trap as above. With it, every settle moves the page the way the visitor was already going. So stopping early in a move leaves it as it is, and the next scroll finishes it.
- **Touch swipe:** pointer events on the stage, touch only, passive. A swipe counts when `|dx| ≥ 40 px` and `|dx| ≥ 1.5 × |dy|`.
  - Swiping left goes to the next topic and swiping right to the previous one, by scrolling the page to that topic's settle point (500 ms). Vertical position and visible topic always match.
  - At the first and last topics, the swipe that would go past the end does nothing.
  - The stage has `touch-action: pan-y pinch-zoom`: the browser keeps vertical panning and pinch zoom, so vertical movement is never prevented.
  - Mouse and trackpad sideways gestures still do nothing.
- **Dots:** four `<button>`s in a `role="group"` labelled "About topics". Each is labelled "Show topic N of 4: Title", and the active one has `aria-current="true"`.
  - The look is the same: 6 × 6 dots, 28 × 6 accent when active, 300 ms.
  - Each button is a 24 × 24 px padded hit area (WCAG 2.5.8), with the accent focus ring.
  - Negative margins keep the row as thin as before. Because the hit areas cannot overlap, the visible gap between dots grows from 8 to 18 px.
  - Click, tap or Enter scrolls to that topic (500 ms), and its words replay on arrival.
- **Numbering removed:** the "01 / 04" line and its CSS are gone in both modes. On phones the freed height goes to the photo (360 × 640: 176 → 205 px).
- **Reduced motion and no JavaScript:** the unchanged plain list. No dots, no settle, no swipe handling, `touch-action` stays `auto`.

## Consequences
- About is 20% longer to scroll through (arrival to arrival 1.2 × viewH, was 1.0).
- The settle never runs outside the pin, never during a nav or go-to-top scroll, and never against the visitor's direction. So early stops in a move (`x` under 0.65 going down, over 0.35 going up) stay as the visitor left them.
- Tested in Chrome and Firefox (desktop and tablet) and in Chrome mobile emulation with real touch events. Results are in the batch 6 report: wheel at 60–800 ms per notch, keyboard arrows, PageUp/PageDown and Space, and touch drags all pass About in both directions with no backward moves.
- Native snapping stays unused. Revisit only if browsers change how proximity snapping treats slow wheel input.
