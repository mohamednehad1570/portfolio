# Glossary

Technical terms used in this project. Columns: Term | Discipline | Meaning | Where in this project.

| Term | Discipline | Meaning | Where in this project |
|---|---|---|---|
| Static export | Web architecture | `next build` produces plain HTML/CSS/JS files with no server needed | `next.config.ts` (`output: 'export'`), `out/` |
| App Router | Frontend framework | Next.js routing where folders under `src/app/` are URLs | `src/app/` |
| Trailing slash | Web architecture | URLs end with `/`, so `/privacy/` maps to `privacy/index.html` on any static host | `next.config.ts` (`trailingSlash`) |
| ESLint | Code quality | Tool that flags likely bugs and style problems in code | `eslint.config.mjs`, `pnpm lint` |
| Type checking (tsc) | Code quality | TypeScript compiler run without output, to find type errors | `pnpm exec tsc --noEmit` |
| ADR | Architecture | Architecture Decision Record: a short note of one decision, why, and what follows | `docs/adr/` |
| pnpm | Tooling | Package manager that stores each dependency once on disk and links it | `package.json`, `pnpm-lock.yaml` |
| Corepack | Tooling | Node's built-in switch that provides pnpm/yarn at the pinned version | `corepack enable pnpm` |
| Conventional Commits | Version control | Commit message format `type(scope): description` | Git history |
| Vendoring | Dependency management | Copying third-party source into your own repo (instead of installing it) so you can edit it | `src/components/rb/` |
| React Bits | Frontend components | Open-source library of animated React components (MIT + Commons Clause) | `src/components/rb/` |
| Commons Clause | Licensing | Licence add-on: you may use the code commercially but not sell or redistribute the components themselves | `src/components/rb/LICENSE-react-bits.md` |
| `'use client'` | Frontend framework | Marks a file as a Client Component that runs in the browser (needed for effects, events, browser APIs) | first line of every file in `src/components/rb/` |
| Client Component | Frontend framework | React component that is hydrated and runs in the browser, as opposed to a server component that only renders HTML at build time | `src/components/rb/`, interactive sections |
| IntersectionObserver | Browser API | Tells you when an element enters or leaves the visible screen area, without polling scroll position | `lib/useEnterOnce.ts` (Reveal, Contact rings), `rb/TextType.jsx`, `rb/CircularText.jsx` (spin only while on screen) |
| requestAnimationFrame | Browser API | Runs a function before the next screen repaint; the standard way to drive animation loops | `StarfieldBackground.tsx`, `rb/StarBorder.jsx` |
| ESLint override | Code quality | Config block that changes lint rules for chosen files only | `eslint.config.mjs` (rule relaxations for `src/components/rb/`) |
| React Compiler lint rules | Code quality | `react-hooks` checks (refs, purity) that assume code is compiler-safe; flag patterns vendored components use on purpose | `eslint.config.mjs` |
| devicePixelRatio | Browser API | How many real screen pixels make one CSS pixel; capped at 2 to save drawing work | `StarfieldBackground.tsx` |
| `next/dynamic` | Frontend framework | Loads a component as a separate JavaScript chunk, on demand | `SiteState.tsx`, `Contact.tsx` |
| `ssr: false` | Frontend framework | Skips rendering a component on the server/at build time; it exists only in the browser | `SiteState.tsx`, `Contact.tsx` |
| Layout shift | Performance | Content jumping when something loads or changes late (measured as CLS). Typed text avoids it by laying out the whole final text invisibly and only revealing characters; the canvas is `position: fixed` so it causes none | `rb/TextType.jsx` (`reserveSpace`), `StarfieldBackground.tsx` |
| Decorative (`aria-hidden`) | Accessibility | Marks an element as invisible to screen readers because it carries no information | `StarfieldBackground.tsx`, `WordReveal.tsx` (animated words) |
| Design tokens | Design systems | Named design values (colours, fonts) defined once and reused everywhere | `src/app/globals.css` (`@theme`) |
| `@theme` | Styling (Tailwind v4) | Tailwind v4 block where tokens are declared; each becomes a CSS variable and a utility class | `src/app/globals.css` |
| `next/font` | Performance | Next.js tool that downloads Google Fonts at build time and self-hosts them, so no request goes to Google at runtime | `src/app/layout.tsx` |
| Variable font | Typography | One font file containing a range of weights/widths/sizes, selected by axes (`wght`, `opsz`) | Bricolage Grotesque in `layout.tsx` |
| Optical size (`opsz`) | Typography | Font axis that adjusts letter shapes for small or large text | `layout.tsx`, `VariableProximity` |
| `font-display: swap` | Performance | Shows fallback text immediately and swaps to the web font when it loads | `layout.tsx` |
| Focus-visible | Accessibility | CSS state for elements focused by keyboard; used for the visible focus ring | `globals.css` |
| `prefers-reduced-motion` | Accessibility | OS setting that asks sites to avoid animation | `globals.css`, components |
| Cascade layer (`@layer`) | Styling | CSS grouping that decides which rules win regardless of order | `globals.css` (`components` layer) |
| `satisfies` | TypeScript | Checks a value against a type without widening the value's own type | `src/content/site.ts` |
| Content as data | Architecture | Page copy kept in typed data files, separate from components | `src/content/site.ts` |
| `wa.me` link | Messaging | WhatsApp's click-to-chat URL; the phone number lives only inside it, never as visible text | `src/content/site.ts` (WhatsApp row) |
| GSAP | Animation | JavaScript animation library (free since 3.13, includes ScrollTrigger and SplitText) | `sections/AboutSideways.tsx`, `rb/SplitText.jsx` |
| ScrollTrigger | Animation | GSAP plugin that ties animation or pinning to scroll position | `sections/AboutSideways.tsx`, `SiteState.tsx` |
| Pinning | Animation / UX | Holding a section fixed on screen while the page scroll "pays" for an animation | Not used since ADR 0003 (it was the old pinned About gallery) |
| Snap (scroll snap) | UX | Scroll position settles on defined stops (here each of the 4 photos) | Not used since ADR 0003; native snapping was tried again for the About settle and rejected (ADR 0014) (it was the old pinned About gallery) |
| `useGSAP` | Frontend framework | React hook that runs GSAP code and cleans it up on unmount | `sections/AboutSideways.tsx` |
| Scrollspy | UX | Highlights the nav link of the section currently on screen | `SiteState.tsx`, `Header.tsx` |
| React Context | Frontend framework | Way to share state with many components without passing props down | `SiteState.tsx` |
| Server Component | Frontend framework | Component rendered to HTML at build time; ships no JavaScript | `page.tsx`, `Projects.tsx`, `Hero.tsx`, `Footer.tsx` |
| `next/image` | Performance | Next.js `<Image>`: lazy loading, size attributes, no layout shift (unoptimized in a static export) | `Hero.tsx` |
| `<noscript>` | Robustness | Content shown only when JavaScript is off. No longer used for animations: the `js` class does that job | (none since batch 1c; `layout.tsx` now sets the `js` class) |
| `100svh` | CSS | "Small viewport height": 100% of the visible height with mobile browser bars shown | `sections.css` (`.hero`, `.is-side`) |
| Safe-area inset | CSS | Space reserved for notches and home bars on phones (`env(safe-area-inset-*)`) | `sections.css` |
| Touch target | Accessibility | Minimum tappable size (44px) for links and buttons | `sections.css` |
| Landmark | Accessibility | Semantic region (`header`, `nav`, `main`, `footer`) that screen readers can jump between | `Header.tsx`, `page.tsx`, `Footer.tsx` |
| Enter-once animation | UX | Entrance effect that plays the first time an element appears, then never again | `Reveal.tsx`, `lib/useEnterOnce.ts`, `sections/SectionText.tsx` |
| Type declaration (`.d.ts`) | TypeScript | File that describes the types of JavaScript code without changing it | `src/components/rb/*.d.ts` |
| 404 page (`not-found.tsx`) | Web architecture | Page shown for URLs that do not exist; a static export writes it to `404.html`, which static hosts serve automatically | `src/app/not-found.tsx` |
| Prefetch | Performance | Next.js loads the files of a linked page in advance (the footer's Privacy link) | `Footer.tsx` |
| Placeholder paragraph | Content | Text in `[brackets]` that Mohammed will write; shown grey | `/privacy`, `TodoText.tsx` |
| `metadata` / `metadataBase` | SEO | Next.js way to set page title, description and tags; `metadataBase` turns relative URLs into absolute ones | `layout.tsx` |
| Open Graph | SEO / social | Tags that control the preview card when a link is shared (title, description, image) | `layout.tsx` |
| Canonical URL | SEO | The one official address of a page, so search engines do not count duplicates | `layout.tsx`, `privacy/page.tsx` |
| Sitemap | SEO | `sitemap.xml`: list of pages for search engines | `src/app/sitemap.ts` |
| `robots.txt` | SEO | File that tells crawlers what they may visit and where the sitemap is | `src/app/robots.ts` |
| JSON-LD | SEO | Structured data embedded as JSON so search engines understand the page | `PersonJsonLd.tsx` |
| schema.org `Person` | SEO | Standard vocabulary describing a person (name, url, profiles) | `PersonJsonLd.tsx` |
| `NEXT_PUBLIC_*` | Configuration | Environment variables that Next.js copies into the browser code at build time (never put secrets in them) | `src/lib/siteUrl.ts`, `.env.example` |
| `force-static` | Web architecture | Route setting that makes a generated file (sitemap, robots) build to a plain file | `sitemap.ts`, `robots.ts` |
| Lazy loading (code splitting) | Performance | Downloading a chunk of JavaScript only when needed, so first paint is not blocked | `SiteState.tsx` (starfield), `Contact.tsx` |
| Fallback (loading state) | UX / robustness | Simple stand-in shown while the real component loads or when it cannot run | `ContactList` |
| `requestIdleCallback` | Browser API | Runs work when the browser is idle; used to pre-download the lazy chunks | `src/lib/useMotionAllowed.ts` |
| `useSyncExternalStore` | Frontend framework | React hook that reads an outside value (here the OS reduced-motion setting) and re-renders when it changes | `src/lib/useMotionAllowed.ts` |
| Hydration | Frontend framework | React attaching to server-made HTML in the browser; the first client render must match the HTML | `useMotionAllowed.ts` (server snapshot = false) |
| Progressive enhancement | Architecture | Page works in its simple form first and gains animation only where the browser allows. Here the `js` class on `<html>` (set by an inline script) is the switch: hidden "before animation" states exist only under it, so blocked scripts or reduced motion always show the full content (rule 10 in `CLAUDE.md`) | `layout.tsx`, `sections.css`, About (plain list vs sticky stack), starfield (static frame vs animated) |
| Focus ring contrast | Accessibility | The visible keyboard-focus outline must stand out from its surroundings (WCAG 2.4.7 / 1.4.11) | `sections.css` (`a.cta.star-border:focus-visible`) |
| Canvas 2D | Graphics | Browser API (`getContext("2d")`) for drawing shapes, lines and gradients on a `<canvas>` with plain JavaScript; no GPU programming needed | `StarfieldBackground.tsx` |
| Constellation link | Graphics / UX | A thin line joining two nearby stars; some are fixed, others appear around the pointer or a tap and fade with distance | `StarfieldBackground.tsx` |
| Shooting star (meteor streak) | Graphics | A short-lived bright head with a fading tail that crosses the sky; here every 5 to 9 seconds, towards the bottom-left | `StarfieldBackground.tsx` (`spawnMeteor`) |
| Delta time (frame-rate independence) | Animation | Scaling movement by the time since the last frame, so speed is the same on 60 Hz and 144 Hz screens | `StarfieldBackground.tsx` (`step`) |
| Debounce | Performance | Waiting until events (here window resizing) stop for a moment before doing costly work | `StarfieldBackground.tsx` (`RESIZE_DEBOUNCE_MS`) |
| `position: sticky` | CSS | Element scrolls normally until it reaches a given offset, then stays there until its container ends | `sections.css` (`.is-side .side-stage`) |
| Sticky stacking | UX / CSS | Several sticky items with growing offsets pile up one under the other as you scroll, newer ones painted on top. Used by the vertical About of batches 1b to 1d; replaced by the sideways stack (ADR 0010) | not used since ADR 0010 |
| Scrubbed animation | Animation | Animation whose progress follows the scroll position exactly (scroll back and it plays back), instead of playing by time | `sections/AboutSideways.tsx` (`--depth`, the slide transforms) |
| Scroll hijacking (scrolljacking) | UX / Accessibility | Taking control of the page scroll (pinning, snapping, smooth-scroll libraries, wheel-capturing boxes, pulling against the visitor's direction), which makes scrolling feel stuck or unfamiliar; banned by ADR 0003 | `CLAUDE.md` rule 9; the About settle (ADR 0014) runs only after the visitor stops and never against their direction |
| Lenis | Tooling | Smooth-scroll JavaScript library that replaces native scrolling; used inside React Bits ScrollStack and therefore not used here | Rejected in ADR 0003 |
| `color-scheme` | CSS | Tells the browser the page is dark (or light) so native parts such as scrollbars and form controls match | `globals.css` (`:root`), `layout.tsx` (`viewport`) |
| `theme-color` | Web platform | `<meta>` tag that tints the mobile browser's address bar; set through the Next.js `viewport` export | `layout.tsx` |
| CSS custom property (variable) | CSS | A `--name` value set once and read with `var()`; here JavaScript sets `--depth` and CSS turns it into scale, brightness and opacity | `sections.css`, `sections/AboutSideways.tsx` |
| `display: flow-root` | CSS | Makes a box contain its children's margins (and floats), so they count inside the box | not used since ADR 0010 (it served the vertical About list) |
| Word reveal | Animation | Text appearing word by word, each from transparent, blurred and slightly low to normal; the sentence stays readable to screen readers | `sections/WordReveal.tsx` |
| `sr-only` | Accessibility | CSS class that hides text visually but keeps it for screen readers | `globals.css`, `WordReveal.tsx` |
| Contrast ratio (WCAG AA) | Accessibility | Brightness difference between text and background; AA needs at least 4.5:1 for body text | Dark theme tokens (ADR 0004) |
| Lighthouse | Quality | Google's free tool that scores a page for performance, accessibility and more (it runs the axe contrast checks) | Part 7 of batch 1b |
| TextType | Animation component | React Bits component that types text one character at a time with a blinking cursor. Used with `loop` off so it types once | `rb/TextType.jsx`, `TypedText.tsx` (hero label and title, section labels) |
| Typewriter effect | Animation / UX | Text appearing character by character as if typed. Kept to short labels and the headline: long body text never types, because that is slow to read | hero label and title, section eyebrows |
| CircularText | Animation component | React Bits component that sets text around a circle and spins it (Motion library); can tilt on hover | `rb/CircularText.jsx`, `sections/ContactRings.tsx` |
| Counter-rotation | Animation | Turning one thing the opposite way to another at the same speed. The ring spins one way and its logo the other (`centerSpin="opposite"`) | `rb/CircularText.jsx` (MODIFIED), `ContactRings.tsx` |
| CSS subgrid | CSS layout | A grid item that is itself a grid and shares its parent's row (or column) tracks, so content in different cards lines up. Here two cards share five rows | `sections.css` (`.project`) |
| Trademark / brand guidelines | Legal / branding | A logo is a registered mark: its owner decides how it may be shown (usually unmodified, not rotated, not recoloured beyond approved versions). Using it to link to the service is normal; altering it is not. ADR 0006 records that the logos here rotate by the site owner's choice and are only recoloured white | `icons/`, `docs/adr/0006-contact-rings.md` |
| Simple Icons | Resource | Open collection of brand logos as SVG; its path data is CC0 (public domain), the logos themselves stay their owners' trademarks. LinkedIn is no longer in the collection | `icons/GitHubIcon.tsx`, `icons/WhatsAppIcon.tsx` |
| `backdrop-filter` | CSS | Blurs (or otherwise filters) what is visible behind an element. The header uses `blur(12px)` over a 88% page-colour fill so text under it is not readable. Needs `-webkit-` for Safari, written before the standard line (see the comment in `sections.css`) | `sections.css` (`.nav`) |
| `scroll-margin-top` | CSS | Space kept above an element when the browser scrolls to it (links like `#about`, keyboard focus), so a sticky header does not cover it | `sections.css` (`section[id]`, header height + 16px; the About pin uses exactly the header height so a nav click lands on the pin start) |
| `js` class | Robustness pattern | A class that a tiny inline script puts on `<html>` the moment JavaScript runs. CSS hides animated elements only under `.js`, so with scripts blocked nothing is hidden | `layout.tsx`, `sections.css` |
| Scroll pacing | UX / animation | How much scrolling a step of a scroll effect costs. About (ADR 0011): one viewport height from one topic arriving to the next (`REST = 0.55` still + `MOVE = 0.45` moving), plus a 0.3 hold for the last topic (`HOLD`). Slower pacing = more wheel notches per topic. Earlier: even `STEP = 0.6` (ADR 0008, 0010) | `sections/AboutSideways.tsx`, `sections.css` (`--side-rest`, `--side-move`, `--side-hold`) |
| Hysteresis | Control / UX | Using two different thresholds for switching on and off (here 0.55 to become the front item, below 0.45 to lose it), so a value hovering near one threshold does not make the state flip back and forth (flicker) | `sections/AboutSideways.tsx` (`FRONT_SWITCH`) |
| `svh` unit | CSS | "Small viewport height": 1svh = 1% of the viewport height with a phone's browser toolbars showing, so it does not change while the toolbar slides in and out. `60svh` = 60% of that height. The existing `100svh` row uses the same unit | `sections.css` (About spacing and hold) |
| `mailto:` link | Web / email | A link whose address starts with `mailto:` opens the visitor's email app with a new message to that address; no form or server is needed. The address is visible to anyone reading the page, so it can receive spam | `site.ts` (`CONTACT_EMAIL`), the Email ring |
| Sticky container limit | CSS | A `position: sticky` item can only move inside its container's content box, and its own bottom margin counts as part of the item. So the last item needs empty space after it inside the container to stay stuck. The sideways About avoids the problem: its stage is the only sticky item and the pin is sized to hold it | `sections.css` (`.side-pin`), ADR 0008 and 0010 |
| Scroll-driven animation | Animation | Animation whose state is a function of the scroll position, not of time. The sideways About computes a progress value from `scrollY` and sets each slide's transform from it | `sections/AboutSideways.tsx` |
| Pinned section | UX / CSS | A section that stays fixed on screen while the page scroll "pays" for something happening inside it. Here it is pure CSS: a tall pin box with a `position: sticky` stage; no scroll-capturing library | `sections.css` (`.side-pin`, `.side-stage`) |
| Horizontal movement on vertical scroll | UX / animation | Content moves sideways while the visitor scrolls down. The wheel, touch and page scroll stay vertical and native; sideways trackpad swipes do nothing, and nothing is captured or snapped (rule 9) | About (ADR 0010) |
| `transform-origin` | CSS | The point a transform (scale, rotate) pivots around. Passed About slides use `0 50%` (left edge, middle) so they shrink toward their left edge and peek out behind the front slide | `sections.css` (`.is-side .side-slide`) |
| z-index stacking | CSS | Which overlapping element is painted on top. All About slides sit in the same place, and a later slide has a higher `z-index`, so each new topic slides over the earlier ones | `AboutSideways.tsx` (`zIndex: i`) |
| `translate3d` | CSS | A transform that moves an element in x, y and z; the 3D form lets the browser move it on the graphics card without re-laying out the page, which is why the slides use it | `sections/AboutSideways.tsx` |
| Rest zone (dwell) | UX / animation | A stretch of scrolling during which a scroll-driven scene does not move at all, so the visitor can read it before the next change. Each About topic rests for 0.55 of a viewport height | `sections/AboutSideways.tsx` (`REST`), ADR 0011 |
| Rest-then-move pacing | UX / animation | Splitting each step of a scroll effect into a still part (rest) and a moving part, instead of moving at an even speed the whole time. Scrolling itself stays native and continuous; only the mapping from scroll position to the scene changes (not snapping) | `sections/AboutSideways.tsx` (`progress`), ADR 0011 |
| Smoothstep easing | Animation / maths | The curve `t² × (3 − 2t)` for `t` from 0 to 1: starts and ends with zero speed, fastest in the middle. Used for the About move, so a slide eases out of its rest and into place without a jolt | `sections/AboutSideways.tsx` (`smoothstep`) |
| Grid stacking (one shared cell) | CSS | Putting several items in the same CSS grid cell (`grid-area`) so they overlap, while the grid still grows to the tallest item. The About slides use it instead of absolute positioning, so heading, slides and dots can be centred as one column | `sections.css` (`.is-side .side-slides`, `.side-slide`) |
| `target="_blank"` + `rel="noopener noreferrer"` | Web / security | Opens a link in a new tab; `noopener` stops the new page from controlling this one through `window.opener`, `noreferrer` also hides which page sent the visitor. Used only for external URLs | `src/lib/links.tsx` (`newTabProps`): booking buttons, Contact rings |
| sharp | Image processing | Node.js library (built on libvips) that resizes and re-encodes images. Used only at build time on Mohammed's machine, never in the browser or on the server | `scripts/images.mjs` (`pnpm images`) |
| Image pipeline | Performance / build | A script that turns originals into the exact web files the page needs (sizes, formats), so the site ships small files without an image server | `scripts/images.mjs`, `scripts/images.config.mjs`, `public/images/generated/` |
| AVIF | Image formats | Modern image format (from the AV1 video codec): much smaller than JPEG/WebP at the same look, supports transparency. Browsers that know it pick it first | `public/images/generated/*.avif`, `<source type="image/avif">` in the hero |
| WebP | Image formats | Google's image format, smaller than JPEG/PNG, supports transparency. The second choice after AVIF | `public/images/generated/*.webp` |
| Alpha channel | Image processing | The fourth value per pixel (after red, green, blue) that says how see-through it is: 0 = invisible, 255 = solid. The hero cutout uses it so the starfield shows around the person and through the faded suit | hero cutout files (AVIF, WebP, PNG) |
| Cutout | Photography / design | A photo with the background removed (transparent), so the person stands directly on whatever is behind the image | `~/Pictures/site-photos/hero-cutout-final.png` → hero |
| Lossless vs palette PNG | Image formats | Lossless PNG keeps every pixel exactly; a palette (quantised) PNG squeezes the image into at most 256 colours to save bytes, which can cause visible steps. The hero PNG fallback is lossless because the palette version banded the fade | `scripts/images.mjs` (`PNG` settings) |
| Banding / halo | Image quality | Banding: a smooth gradient turning into visible stripes. Halo: a light or dark fringe around a cut-out edge. The two things to check after compressing a transparent image | checked for the hero in ADR 0013 |
| EXIF metadata | Privacy / images | Hidden data inside photo files (camera, date, sometimes GPS location). Removed from every generated file | `scripts/images.mjs` (sharp drops it by default) |
| Image manifest | Build | A generated file listing each web image's URLs and size, so components never hard-code them and a new photo needs no code change | `src/content/images.generated.ts` |
| `<picture>` + `srcset` + `sizes` | HTML / performance | `<picture>` lists the same image in several formats (`<source type>`); the browser takes the first it supports. `srcset` lists widths (`480w, 840w, 1200w`); `sizes` tells the browser how wide the image will be drawn, so it downloads the smallest file that is still sharp on that screen | `src/components/Picture.tsx`, `HERO_SIZES` in `src/lib/images.ts` |
| LCP (Largest Contentful Paint) | Performance | Core Web Vital: when the biggest thing on the first screen (here the hero photo) is painted. Its parts: time to first byte, load delay, load time, and render delay (time the downloaded image waits before it is shown) | the hero photo (ADR 0013) |
| Element render delay | Performance | The LCP part between "image downloaded" and "image painted". It was ~2 s here because the photo stayed `opacity: 0` until JavaScript started; the photo is now never hidden | `.hero-photo` in `sections.css` |
| Preload (`rel="preload" as="image"`) | Performance | A `<link>` in `<head>` that starts a download before the browser reaches the element that needs it. For responsive images it carries `imagesrcset`/`imagesizes`; `type="image/avif"` makes browsers without AVIF skip it | `Hero.tsx` (`preload()` from `react-dom`, rendered into `<head>`) |
| `fetchpriority="high"` | Performance | Hint that one download matters more than others (the LCP image), so the browser fetches it before lower-priority files | hero `<img>` and its preload |
| `summary_large_image` | SEO / social | Twitter/X card type that shows a wide image (1200 × 630) above the link, instead of a small square | `src/app/layout.tsx` (`twitter.card`) |
| `visibility: hidden` (delayed) vs `opacity: 0` | CSS / accessibility | `opacity: 0` only makes something see-through: it can still be focused with Tab. `visibility: hidden` also removes it from the tab order and from screen readers. Delaying the visibility change until the fade ends (`transition: visibility 0s 0.3s`) gives both a smooth fade and a clean removal | `.about-pinned .to-top` in `sections.css` (phones) |
| Scroll-snap proximity vs mandatory | CSS / UX | `scroll-snap-type: y mandatory` always lands on a snap point when scrolling stops; `proximity` snaps only when the stop is "close enough" (the browser decides how close). Both act on every scroll end, including each single mouse-wheel notch | Tested for the About settle and rejected: in Chrome, proximity pulled a slow wheel back after every notch (ADR 0014) |
| Idle settle | UX / animation | After the visitor has stopped scrolling for a short time (here 200 ms) and is caught mid-transition, the page eases to the nearest resting point; any new input stops it at once | `AboutSideways.tsx` (`trySettle`): only mid-move, within 0.35 of a topic, in the visitor's direction of travel, inside the pin (ADR 0014) |
| Direction of travel | UX | Which way the visitor last scrolled (down or up). A settle that only moves that way can never pull them back or trap them | `AboutSideways.tsx` (`travel`) |
| Scroll tween | Animation | Moving the page from one scroll position to another over time with an easing curve, frame by frame (`requestAnimationFrame` + `window.scrollTo`), instead of jumping | `AboutSideways.tsx` (`tweenTo`): dots and swipes 500 ms, settle 450 ms, ease-out cubic |
| Swipe gesture | UX / touch | A quick finger stroke across the screen. Here it counts only when it travels at least 40 px sideways and at least 1.5 times more sideways than vertical | About stage: left = next topic, right = previous (ADR 0014) |
| Pointer events (`pointerType`) | Browser API | One event family (`pointerdown`, `pointerup`, `pointercancel`) for mouse, pen and touch; `pointerType` says which. `pointercancel` fires when the browser takes a gesture over (e.g. a vertical pan) | `AboutSideways.tsx` swipe handling (touch only) |
| `touch-action: pan-y` | CSS / touch | Tells the browser to handle only vertical panning on an element; sideways finger moves are left to the page's own code. `pinch-zoom` added keeps zooming possible | `.is-side .side-stage` (`pan-y pinch-zoom`) |
| Passive event listener | Browser API / performance | A listener registered with `{ passive: true }` promises never to call `preventDefault()`, so the browser can scroll at once without waiting for it | Every About scroll, wheel, touch and pointer listener (ADR 0014) |
| `aria-current` | Accessibility | Marks the current item in a set (page, step, item); screen readers announce it as "current" | The active About dot (`aria-current="true"`) |
| `role="group"` + `aria-label` | Accessibility | Groups related controls under one name, read before the controls | About dots: "About topics" |
| Target size (WCAG 2.5.8) | Accessibility | WCAG 2.2 AA: anything clickable or tappable is at least 24 × 24 CSS px, or spaced so a 24 px circle around it touches nothing else | About dots: 6 px visible, 24 × 24 px button around it |
| "Opens in a new tab" note | Accessibility | Text only screen readers hear (`sr-only` span, or added to an `aria-label`) warning that a link opens a new tab, so the change of context is not a surprise | `src/lib/links.tsx` (`NewTabNote`, `newTabLabel`): booking buttons and rings, Cal.com privacy link |
