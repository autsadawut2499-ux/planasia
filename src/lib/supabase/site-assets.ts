export const SITE_ASSETS_BUCKET = "site-assets";

/** Must stay in sync with storage.buckets.allowed_mime_types for site-assets. */
export const SITE_ASSETS_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
] as const;

/** Document uploads (vendor blueprints / BOQ) — PDF only. */
export const SITE_ASSETS_DOCUMENT_MIME_TYPES = ["application/pdf"] as const;

export const SITE_ASSETS_ALLOWED_MIME_TYPES = [
  ...SITE_ASSETS_IMAGE_MIME_TYPES,
  ...SITE_ASSETS_DOCUMENT_MIME_TYPES,
] as const;

/**
 * Max document size (100MB) — blueprint / permit PDF sets.
 * Must stay ≤ storage.buckets.file_size_limit and
 * next.config experimental.middlewareClientMaxBodySize.
 */
export const SITE_ASSETS_DOC_MAX_BYTES = 100 * 1024 * 1024;
export const SITE_ASSETS_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

export function formatMb(bytes: number): string {
  return String(Math.round(bytes / 1024 / 1024));
}

export function getSiteAssetPublicUrl(storagePath: string): string {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required to build site-asset URLs");
  }
  return `${base}/storage/v1/object/public/${SITE_ASSETS_BUCKET}/${storagePath}`;
}

export function siteAssetPath(category: string, filename: string): string {
  // Keep nested folders (e.g. popular/ph-1) while stripping unsafe chars.
  const safeCategory = category
    .split("/")
    .map((part) => part.replace(/[^a-zA-Z0-9_-]/g, "_"))
    .filter(Boolean)
    .join("/");
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${safeCategory || "general"}/${Date.now()}_${safeName}`;
}

/** Extract storage object path from a public site-assets URL, or null if not ours. */
export function extractSiteAssetPath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${SITE_ASSETS_BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  const path = publicUrl.slice(idx + marker.length).split("?")[0];
  return path || null;
}
