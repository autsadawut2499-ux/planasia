/**
 * Append a cache-busting query so browsers / next/image pick up replaced assets
 * even when a CDN still holds the previous object briefly.
 */
export function withMediaCacheBust(
  url: string | null | undefined,
  version?: string | number | null,
): string {
  const raw = (url ?? "").trim();
  if (!raw) return "";
  const v =
    version != null && String(version).trim()
      ? String(version).trim()
      : String(Date.now());
  try {
    // Absolute http(s) URLs
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      u.searchParams.set("v", v);
      return u.toString();
    }
  } catch {
    // fall through
  }
  const stripped = raw.replace(/([?&])v=[^&]*(&|$)/, (_, p1, p2) =>
    p2 === "&" ? p1 : "",
  );
  const sep = stripped.includes("?") ? "&" : "?";
  return `${stripped}${sep}v=${encodeURIComponent(v)}`;
}
