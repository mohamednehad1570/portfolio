# ADR 0004: Dark (night-sky) theme

- Status: Accepted (decision D21, plus colour parts of D16 and D17)
- Date: 2026-11-06
- Related: [0002](0002-night-sky-background.md), [0003](0003-about-scroll-stack.md)

## Context
The site was white with a blue accent. The night-sky background (0002) and the transparent About (0003) need a dark page so the stars show through every section.

## Options considered
- **Keep white and put the sky in a dark band only:** breaks the "one fixed layer behind everything" idea and splits the page in two moods.
- **Light and dark switch:** double the design and testing work for a one-page portfolio; no one asked for it.
- **Dark only (chosen):** one theme, tokens below.

## Decision
Dark only. Tokens: bg `#0a1626`, ink `#e9eef4`, muted `#a3adba`, todo `#8a94a1`, line `rgba(255,255,255,0.14)`, accent `#6fb0e0`, accent-strong `#1f5f8b`, accent-soft `rgba(111,176,224,0.12)`. Fonts unchanged. `color-scheme: dark` and `<meta name="theme-color" content="#0a1626">`.
- Buttons keep StarBorder + Magnet + ClickSpark exactly; only their colours change.
- D17: Contact blue rows use `#1f5f8b` background with `#ffffff` text; clear rows are transparent with ink text.
- D16 (provisional): the Emaar browser frame stays light, the Kubernetes terminal frame stays dark.

## Consequences
- Every hard-coded light colour outside the token file and the Contact bands must go through a token.
- Body text on bg must keep WCAG AA (4.5:1). `muted` (`#a3adba`), `todo` (`#8a94a1`) and `ink` pass on `#0a1626`; this is checked with axe/Lighthouse.
- Open decision for Mohammed after he sees the build: whether both project frames should be dark.
