/**
 * Picture: one generated image (ADR 0013) as `<picture>` with AVIF, then WebP, then the fallback file.
 * Why: the browser picks the first format it understands and, from its srcset, the smallest width that is sharp
 * at the visitor's screen size (`sizes`). `width`/`height` give the box its aspect ratio before any byte arrives,
 * so nothing shifts. No hooks: it renders the same on the server and in the browser.
 * `draggable={false}` stops the browser's own image drag (the About card stack drags the card instead).
 */
import type { GeneratedImage } from "@/content/images.generated";

type Props = {
  image: GeneratedImage;
  alt: string;
  sizes: string;
  priority?: boolean; // the LCP image: eager + high fetch priority; everything else loads lazily
  className?: string;
  draggable?: boolean;
};

export default function Picture({ image, alt, sizes, priority = false, className, draggable }: Props) {
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={image.avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={image.webpSrcSet} sizes={sizes} />
      <img
        src={image.src}
        width={image.width}
        height={image.height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        draggable={draggable}
      />
    </picture>
  );
}
