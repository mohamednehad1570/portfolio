# ADR 0005: One text animation system for the whole site

- Status: Accepted (decisions D14 revised and D22 new, 2026-11-06, approved on samples). Supersedes the text rows of D20 (per-section text effects of batch 1) and the hero text effects of D14 as first built (DecryptedText label, SplitText title).
- Date: 2026-11-06
- Amended by [0008](0008-about-scroll-pacing-and-replay.md): the About reveal replays; everything else still plays once.
- Related: [0003](0003-about-scroll-stack.md) (About keeps its own word-by-word reveal), [0004](0004-dark-theme.md)

## Context
Batch 1 gave every section its own text effect (scrambled label, rising H1, scroll-lit intro line). Seen together they felt unrelated, the scroll-lit intro line started at 15% opacity (a contrast failure and an "unfinished" look), and several effects hid their text in the server HTML, so a visitor whose scripts were blocked saw an empty page.

## Options considered
- **Keep one effect per section:** no extra work, but the page keeps feeling like a sampler.
- **Everything types letter by letter:** consistent, but slow to read and tiring for body text.
- **One role-based system (chosen):** the effect depends on the role of the text, the same in every section.

## Decision
| Role | Effect | Component |
|---|---|---|
| Hero label, then hero title | typed once, label first; only the title's cursor keeps blinking | TextType |
| Hero description | words blur in (about 28 ms stagger) | BlurText |
| Hero buttons | fade up last | CSS |
| Section label (eyebrow) | typed once (about 60 ms per character), cursor hides about 0.9 s after typing ends | TextType |
| Section headline (H2) and card titles (H3) | words rise 110% to 0, 70 ms stagger, 700 ms, `cubic-bezier(.2,.7,.2,1)` | SplitText |
| Intro line | words blur 8 px to 0 and rise 12 px to 0, 600 ms, about 45 ms stagger | BlurText |
| Body paragraph | the whole block fades up (opacity, blur 6 px to 0, 16 px up), 700 ms | CSS (`Reveal`) |
| "Let's talk." | the words rise as above, and VariableProximity stays on top | SplitText-style rise + VariableProximity |

Each effect plays once, when about 20% of the element is visible. About keeps its word-by-word reveal (ADR 0003). Nothing animates per letter in body text. DecryptedText and ScrollReveal are no longer used and are removed.

New rule (`CLAUDE.md` rule 8, **visible without animation**): every animated element is fully visible when JavaScript has not run and under `prefers-reduced-motion: reduce`. Pre-animation (hidden) states are applied only under a `js` class that a tiny inline script puts on `<html>`.

## Consequences
- Typed text reserves its final box (all characters are laid out, the untyped ones invisible), so lines never jump while typing.
- Typed and split text keep a full-text copy for screen readers; the animated pieces are `aria-hidden`.
- The vendored TextType, BlurText and SplitText carry small `MODIFIED` changes (see `src/components/rb/README.md`).
- The `<noscript>` style that forced `.reveal` visible is replaced by the `js` class.
