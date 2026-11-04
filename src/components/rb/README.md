# Vendored React Bits components

Copied from the approved prototype (`reference/prototype/src/rb/`), which took them from
[React Bits](https://github.com/DavidHDev/react-bits) by David Haz (MIT + Commons Clause, see `LICENSE-react-bits.md`).
They are used inside this website only; they are not resold or redistributed as components.
Every file starts with `'use client'` (they use browser APIs). Changes are marked `MODIFIED` in the code.
No `@hugeicons/*` packages are used.

| Component | Used for | Modified? |
|---|---|---|
| `CircularGallery` | About photo carousel | Yes: vertical wheel is ignored (only horizontal deltas turn it); engine exposes `goTo(index)`; new `activeIndex` prop drives it; `loseContext()` removed from cleanup (it broke the Strict Mode remount in dev) |
| `FlowingMenu` | Contact rows | Yes: Hugeicons removed; `alwaysOn` prop (all bands visible, `clipPath: none`, marquee always running); per-row `bandColor` / `bandText`; per-row `external` flag adds `target="_blank" rel="noopener noreferrer"`; `data-always` hides the static label visually (still read by screen readers); round image spins (CSS `rotate`, 20 s, off under reduced motion); marquee loop pauses while the menu is off-screen (IntersectionObserver) |
| `StarBorder` | Button border | No |
| `Magnet` | Button pull | No |
| `ClickSpark` | Button click effect | No |
| `GlareHover` | Project frames | No |
| `SplitText` | H1 and section H2 | No |
| `BlurText` | Hero description, About paragraph | No |
| `DecryptedText` | Hero label | No |
| `ScrollReveal` | Section intro lines | No |
| `VariableProximity` | "Let's talk." | No |

Besides the `MODIFIED` markers, each file got a short header comment naming its source.

ESLint: the newer React Compiler lint rules (`react-hooks/refs`, `purity`, `set-state-in-effect`) flag patterns these
components use on purpose (a ref holding the latest props, `performance.now()` in event handlers). They are relaxed for
this folder only in `eslint.config.mjs`, so upstream updates stay easy to diff.
