/**
 * PersonJsonLd: structured data (schema.org Person) in the page head area, for search engines.
 * Why: only confirmed facts go in: name, photo (the largest hero file, ADR 0013), site address and the public
 * LinkedIn/GitHub profiles.
 * Do not add job titles, employers or awards here until Mohammed confirms the exact wording.
 */
import { site } from "@/content/site";
import { HERO_LARGEST } from "@/lib/images";
import { SITE_URL } from "@/lib/siteUrl";

export default function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: SITE_URL,
    image: new URL(HERO_LARGEST.webp, SITE_URL).href, // WebP: understood by more crawlers than AVIF
    sameAs: site.profiles,
  };
  // "<" is escaped so the JSON can never close the script tag early
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
