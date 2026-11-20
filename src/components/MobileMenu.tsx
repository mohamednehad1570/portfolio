/**
 * MobileMenu: the phone navigation (below 768 px, batch 12): a glass burger fixed top-right that opens the React Bits
 * Bubble Menu (src/components/rb/BubbleMenu.tsx) with the bubbles from site.ts, in order: Home, About, Projects,
 * Let's talk, Schedule a call (the booking link: accent fill, new tab).
 * Why a wrapper: the vendored component stays generic; this file feeds it the site's copy and link rules
 * (external links open a new tab and screen readers hear so, src/lib/links.tsx).
 * It must be a direct child of `.page`: while open, the menu makes its siblings (header, main, footer, back-to-top)
 * inert. Hidden from 768 px up and without JavaScript (CSS in BubbleMenu.css).
 */
"use client";

import { site } from "@/content/site";
import { isExternal, newTabProps } from "@/lib/links";
import BubbleMenu, { type BubbleMenuItem } from "./rb/BubbleMenu";

const ITEMS: BubbleMenuItem[] = site.menu.map((item) => ({
  label: item.label,
  href: item.href,
  accent: "accent" in item ? item.accent : undefined,
  ...newTabProps(item.href),
  srNote: isExternal(item.href) ? site.newTabNote : undefined,
}));

export default function MobileMenu() {
  return <BubbleMenu items={ITEMS} menuAriaLabel={site.menuLabel} navAriaLabel={site.navAriaLabel} />;
}
