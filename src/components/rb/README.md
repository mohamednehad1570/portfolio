# Vendored React Bits components

Copied from the approved prototype (`reference/prototype/src/rb/`), which took them from
[React Bits](https://github.com/DavidHDev/react-bits) by David Haz (MIT + Commons Clause, see `LICENSE-react-bits.md`).
They are used inside this website only; they are not resold or redistributed as components.
Every file starts with `'use client'` (they use browser APIs). Changes are marked `MODIFIED` in the code.
No `@hugeicons/*` packages are used.
`CircularGallery` (the old About carousel) was removed in batch 1b (ADR 0003); it needed no npm package, so nothing else was uninstalled.
`DecryptedText` and `ScrollReveal` were removed in batch 1c (ADR 0005, one text animation system).

| Component | Used for | Modified? |
|---|---|---|
| `FlowingMenu` | Contact rows | Yes: Hugeicons removed; `alwaysOn` prop (all bands visible, `clipPath: none`, marquee always running); per-row `bandColor` / `bandText`; per-row `external` flag adds `target="_blank" rel="noopener noreferrer"`; `data-always` hides the static label visually (still read by screen readers); round image spins (CSS `rotate`, 20 s, off under reduced motion); marquee loop pauses while the menu is off-screen (IntersectionObserver) |
| `StarBorder` | Button border | No |
| `Magnet` | Button pull | No |
| `ClickSpark` | Button click effect | No |
| `GlareHover` | Project frames | No |
| `SplitText` | Section H2 / H3 and privacy headings (words rise) | Yes: the hidden "before" state is the class `split-pending` (applied by CSS under `.js` only) instead of an inline `visibility: hidden`, so the server HTML is never invisible (rule 8) |
| `BlurText` | Hero description and intro lines | Yes: `play` prop holds the words until the parent says go (hero description waits for the typed title) |
| `TextType` | Hero label and title, section labels | Yes: `threshold`, `enabled`, `reserveSpace`, `onTypingComplete` props; cursor hidden until typing starts; caret is an inline word-joiner (no mid-word line breaks); CSS shows the whole text without JavaScript and with reduced motion |
| `VariableProximity` | "Let's talk." | No |

Besides the `MODIFIED` markers, each file got a short header comment naming its source.

ESLint: the newer React Compiler lint rules (`react-hooks/refs`, `purity`, `set-state-in-effect`) flag patterns these
components use on purpose (a ref holding the latest props, `performance.now()` in event handlers). They are relaxed for
this folder only in `eslint.config.mjs`, so upstream updates stay easy to diff.
