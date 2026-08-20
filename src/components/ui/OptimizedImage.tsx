"use client";

import Image, { type ImageProps } from "next/image";
import { canOptimizeImageUrl } from "@/lib/media/can-optimize-image";

type OptimizedImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  /** Default 72 — lighter payloads for cards / galleries. */
  quality?: number;
};

/**
 * Web-friendly image: Next.js optimizer (AVIF/WebP + resize) when allowed,
 * otherwise a lazy native <img>. Prefer `fill` + sized parent to avoid CLS.
 */
export function OptimizedImage({
  src,
  alt,
  className,
  fill,
  sizes,
  priority = false,
  quality = 72,
  ...rest
}: OptimizedImageProps) {
  if (!src) return null;

  if (!canOptimizeImageUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={className}
        style={
          fill
            ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
            : undefined
        }
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      quality={quality}
      loading={priority ? undefined : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={className}
      {...rest}
    />
  );
}
