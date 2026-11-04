/**
 * Root layout: loads the two site fonts and wraps every page.
 * Why: next/font downloads the fonts at build time and serves them from our own domain (no runtime
 * stylesheet link, no request to Google from the visitor's browser, no layout jump).
 */
import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";
import "./sections.css";
import PersonJsonLd from "@/components/PersonJsonLd";
import { site } from "@/content/site";
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
    images: [{ url: site.seo.ogImage, width: 340, height: 425, alt: site.seo.ogImageAlt }],
  },
  twitter: { card: "summary", title: site.seo.title, description: site.seo.description, images: [site.seo.ogImage] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable}`}>
      <body>
        {/* Without JavaScript the enter animations would leave content invisible, so show it at once */}
        <noscript>
          <style>{".reveal{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <PersonJsonLd />
        {children}
      </body>
    </html>
  );
}
