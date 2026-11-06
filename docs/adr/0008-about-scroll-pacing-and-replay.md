# ADR 0008: About scroll pacing, a landing that holds, and text that replays

- Status: Accepted (decision D15, amended 2026-11-06). Amends [0003](0003-about-scroll-stack.md) (pacing and the last photo) and the "plays once" rule of [0005](0005-text-animation-system.md) **for About only**.
- Date: 2026-11-06
- The vertical pacing is superseded by [0010](0010-about-sideways-stack.md); `STEP`, `HOLD` and the replay rule are kept.
- Related: [0003](0003-about-scroll-stack.md), [0005](0005-text-animation-system.md)

## Context
Mohammed saw the About stack release too early: the 4th photo stopped about 170 px below the pile and the page moved on to Projects. Measured on the batch 1c build:
- The 4th item **never sticks**. It scrolls 1:1 through its sticky top (180 px at 1440 and 834, 62 px at 390) without stopping.
- When the stack starts to release, the 4th item is still 100 px (1440×900), 141 px (834×1112) and 120 px (390×844) below its sticky top.
- The distance between two arrivals was 1.13 to 1.26 times the viewport height, not the intended 55%: it was the item height plus the 55svh margin.
- Cause: a sticky item may only travel inside its container's content box, and its own bottom margin counts as part of the item. The last item's margin (35svh) ended exactly at the list's bottom edge, so its travel was zero. Items 1 to 3 were held only because later items and their margins extended the container. The 35% "hold" of batch 1b therefore never existed.

## Options considered
- **Padding on the list:** padding is outside the content box, so it does not give the last item room. Rejected.
- **A taller last item:** changes the look of one photo. Rejected.
- **Trailing space inside the list (chosen):** an empty `::after` block of `HOLD × 100svh` at the end of the list extends the content box beyond the last item's margin box, so the last item can stick for exactly that distance.

## Decision
- **Pacing:** the scroll distance from one photo arriving to the next is `STEP = 0.6` of the viewport height (60svh, about 5 to 6 wheel notches at 900 px). The flow spacing between items is `STEP × 100svh + stack step`, so the arrival-to-arrival distance is exactly `STEP`; the item's own margin-bottom is that spacing minus the item height (it may be negative). Item heights stay 560 / 720 / 600 px, capped to the viewport.
- **Landing:** the last photo reaches its sticky position and holds there for `HOLD = 0.3` (30svh) of scrolling before the whole stack scrolls away. **No snapping.**
- **Arrival** for the depth effect = `clamp(1 − (itemTop − stickyTop) / (STEP × viewport), 0, 1)`. Depth effects are unchanged.
- **Replay:** the item that is in front replays its title and paragraph word reveal every time it becomes the front item, scrolling down and back up. Front = the last item whose arrival is at least 0.55, with hysteresis (gains front at 0.55, loses it below 0.45).

## Consequences
- Both constants live in one place and are shared by the CSS (as custom properties) and the scroll code.
- The About section is shorter than before.
- Screen readers keep reading each topic's text once (the replaying words are `aria-hidden`).
- Reduced motion and no JavaScript: a plain list, no replay.
