/**
 * Colour constants for code that cannot read CSS variables (canvas sparks, StarBorder, marquee bands).
 * Why: the same values as the tokens in app/globals.css (ADR 0004); keep the two in sync.
 */
export const BG = "#0a1626"; // page background (also the canvas fill and the browser theme-color)
export const ACCENT = "#6fb0e0"; // light blue: button border, sparks
export const ACCENT_STRONG = "#1f5f8b"; // deep blue: bands that carry white text
export const INK = "#e9eef4";
export const LINE = "rgba(255, 255, 255, 0.14)"; // hairline between contact rows
export const SURFACE = "#0e1626"; // button face: a touch lighter than the page so the button reads as a shape
