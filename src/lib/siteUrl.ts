/**
 * Public address of the site, used for canonical/Open Graph URLs, the sitemap and structured data.
 * Why: set NEXT_PUBLIC_SITE_URL at build time once the real domain exists (decision D4 is still open).
 */
// TODO(Mohammed): replace the fallback (or set NEXT_PUBLIC_SITE_URL) when the domain is bought.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com").replace(/\/+$/, "");
