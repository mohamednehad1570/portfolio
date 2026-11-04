/**
 * sitemap.xml: lists the two indexable pages. `force-static` makes it a plain file in out/ (static export).
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteUrl";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/privacy/` },
  ];
}
