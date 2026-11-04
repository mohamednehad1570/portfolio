/**
 * Root layout: loads the two site fonts and wraps every page.
 * Why: next/font downloads the fonts at build time and serves them from our own domain (no runtime
 * stylesheet link, no request to Google from the visitor's browser, no layout jump).
 */
import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import "./globals.css";

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
  title: "Mohammed Nehad · Web developer",
  description: "Websites that are fast, clear and built to last.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${instrument.variable}`}>
      <body>{children}</body>
    </html>
  );
}
