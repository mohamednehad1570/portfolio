/**
 * Colour constants for code that cannot read CSS variables (canvas sparks, StarBorder, the Contact rings).
 * Why: the same values as the tokens in app/globals.css (ADR 0004); keep the two in sync.
 * SKY_*: the night-sky look shared by the starfield canvas and the About constellation, so the two always match.
 */
export const BG = "#0a1626"; // page background (also the canvas fill and the browser theme-color)
export const ACCENT = "#6fb0e0"; // light blue: button border, sparks
export const INK = "#e9eef4";
export const LINE = "rgba(255, 255, 255, 0.14)"; // hairline borders (project frame, button track)
export const SURFACE = "#0e1626"; // button face: a touch lighter than the page so the button reads as a shape

// Night sky (StarfieldBackground draws with these; the About constellation reuses them in SVG/CSS).
export const SKY_STAR = "rgb(205,225,245)"; // star colour
export const SKY_LINK = "rgb(120,180,230)"; // constellation line colour
export const SKY_LINK_ALPHA = 0.16; // constellation line opacity
export const SKY_LINK_WIDTH = 0.6; // constellation line width (px)
export const SKY_BRIGHT_R: [number, number] = [1.2, 1.9]; // radius range of the bright stars (px)
export const SKY_BRIGHT_ALPHA = 0.95; // opacity of the bright stars
export const SKY_TWINKLE_MIN = 0.55; // twinkle swings opacity between this share and 1
