/**
 * Next.js config: the site is fully static (D1), so `next build` writes plain HTML/CSS/JS into `out/`
 * that any static host can serve.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // static export: no server, no API routes
  images: { unoptimized: true }, // the image optimiser needs a server; photos are pre-sized in /public instead
  trailingSlash: true, // /privacy/ → out/privacy/index.html, works on every static host
  // Tailwind v4 is compiled by its Turbopack loader (set up by create-next-app).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
