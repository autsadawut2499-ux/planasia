/**
 * Whether Next.js `<Image>` can optimize this URL (remotePatterns / local).
 */
export function canOptimizeImageUrl(src: string): boolean {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return false;
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    return (
      host === "images.unsplash.com" ||
      host.endsWith(".supabase.co") ||
      host === "localhost" ||
      host === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

/**
 * Warm the browser cache with the same `/_next/image` URL Next will request
 * (AVIF/WebP + resize) so gallery swaps feel instant.
 */
export function nextOptimizedImageSrc(
  src: string,
  width = 1200,
  quality = 75,
): string {
  if (!canOptimizeImageUrl(src)) return src;
  const params = new URLSearchParams({
    url: src,
    w: String(width),
    q: String(quality),
  });
  return `/_next/image?${params.toString()}`;
}
