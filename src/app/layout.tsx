/**
 * Root layout: loads the two site fonts and wraps every page.
 * Why: next/font downloads the fonts at build time and serves them from our own domain (no runtime
 * stylesheet link, no request to Google from the visitor's browser, no layout jump).
 */
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import "./sections.css";
import PersonJsonLd from "@/components/PersonJsonLd";
import { site } from "@/content/site";
import { OG_IMAGE } from "@/lib/images";
import { BG } from "@/lib/theme";
import { SITE_URL } from "@/lib/siteUrl";

// Display font. Variable font with weight + optical-size axes: VariableProximity animates both.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

// Body font.
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL), // makes relative image/canonical paths absolute
  title: site.seo.title,
  description: site.seo.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
    url: "/",
    images: [{ url: OG_IMAGE.src, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: site.seo.ogImageAlt }],
  },
  // summary_large_image: the wide 1200 x 630 card (a plain "summary" card would crop it to a small square)
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
    images: [{ url: OG_IMAGE.src, alt: site.seo.ogImageAlt }],
  },
};

// Dark theme (ADR 0004): <meta name="theme-color"> tints the mobile browser bar, color-scheme darkens native UI.
export const viewport: Viewport = { themeColor: BG, colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior: Next.js 16 no longer switches smooth scrolling off during page navigation by itself;
    // this attribute asks it to, so the home <-> /privacy transitions stay instant while in-page jumps stay smooth.
    // suppressHydrationWarning: the inline script below adds the `js` class before React hydrates.
    <html lang="en" data-scroll-behavior="smooth" className={`${bricolage.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        {/* Rule 8 (visible without animation): marks "JavaScript is running". CSS hides animated text and
            elements only under `.js`, so with scripts blocked (or before they run) nothing is ever hidden. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <PersonJsonLd />
        {children}
      </body>
    </html>
  );
}
