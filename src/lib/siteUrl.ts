/**
 * Public address of the site, used for canonical/Open Graph URLs, the sitemap, robots.txt and structured data.
 * Why: the domain is mohammednehad.com (ADR 0009); NEXT_PUBLIC_SITE_URL can still override it at build time
 * (for example for a preview deployment).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mohammednehad.com").replace(/\/+$/, "");
