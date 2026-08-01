/** Canonical public site URL for sitemap, OG, and JSON-LD. */
export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}
