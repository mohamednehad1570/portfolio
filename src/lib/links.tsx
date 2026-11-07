/**
 * links: one rule for when a link opens in a new tab (ADR 0011, 0014).
 * Why: external URLs (the Cal.com booking link on the Hero and Projects buttons and Contact ring 5, the other
 * contact rings, the Cal.com privacy link) open in a new tab; in-page and mailto links stay in the page.
 * `noopener noreferrer`: the new tab gets no handle back to this page and no referrer.
 * Screen readers are told a new tab opens: `NewTabNote` (sr-only text inside the link) or `newTabLabel` (for links
 * named by aria-label, where text inside would be ignored).
 */
import { site } from "@/content/site";

export const isExternal = (href: string) => /^https?:\/\//.test(href);

/** Spread onto an <a>: new-tab attributes for external URLs, nothing for in-page or mailto links. */
export const newTabProps = (href: string) =>
  isExternal(href) ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : {};

/** An aria-label with " (opens in a new tab)" added when the link opens one. */
export const newTabLabel = (label: string, href: string) => (isExternal(href) ? `${label} ${site.newTabNote}` : label);

/** Screen-reader-only " (opens in a new tab)" to put inside a link's text, when the link opens one. */
export function NewTabNote({ href }: { href: string }) {
  return isExternal(href) ? <span className="sr-only"> {site.newTabNote}</span> : null;
}
