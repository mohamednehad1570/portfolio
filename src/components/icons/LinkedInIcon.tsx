/**
 * LinkedInIcon: LinkedIn's official "in" logo (white version), shown unmodified.
 * Why: the Contact ring for LinkedIn. LinkedIn distributes this mark only as PNG (no SVG), so it is a raster
 * image here, scaled down to 140x130 px (about 2x its largest display size) and stored as lossless WebP.
 * Source and trademark note: see README.md in this folder. Decorative (empty alt): the link carries the name.
 */
import Image from "next/image";
import logo from "./linkedin-in-white.webp";

export default function LinkedInIcon() {
  return <Image src={logo} alt="" width={140} height={130} aria-hidden="true" draggable={false} />;
}
