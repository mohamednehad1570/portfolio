/**
 * links: one rule for when a link opens in a new tab (ADR 0011).
 * Why: the booking links (Hero and Projects buttons, Contact ring 5) all point to BOOKING_URL. While it is the
 * in-page placeholder "#contact" they must stay in the page; once it is the real Cal.com URL they open a new tab.
 * `noopener noreferrer`: the new tab gets no handle back to this page and no referrer.
 */
export const isExternal = (href: string) => /^https?:\/\//.test(href);

/** Spread onto an <a>: new-tab attributes for external URLs, nothing for in-page or mailto links. */
export const newTabProps = (href: string) =>
  isExternal(href) ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : {};
