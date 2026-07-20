import type { StoreListing } from "@/lib/store/db";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function shortId(id: string): string {
  return slugify(id).slice(-12) || "plan";
}

/** SEO-friendly path segment, e.g. `modern-house-2-floor-3-bed-a1b2c3`. */
export function buildListingSlug(
  input: Pick<StoreListing, "style" | "floors" | "beds" | "id"> & { name?: string },
): string {
  const style = slugify(input.style) || "custom";
  const parts = [style, "house", `${input.floors}-floor`];
  if (input.beds > 0) parts.push(`${input.beds}-bed`);
  return `${parts.join("-")}-${shortId(input.id)}`;
}

/** Ensure slug is unique within existing listings. */
export function ensureUniqueSlug(
  base: string,
  existingSlugs: Set<string>,
  listingId: string,
): string {
  if (!existingSlugs.has(base)) return base;
  let candidate = `${base}-${shortId(listingId)}`;
  if (!existingSlugs.has(candidate)) return candidate;
  let i = 2;
  while (existingSlugs.has(`${candidate}-${i}`)) i += 1;
  return `${candidate}-${i}`;
}

export function listingStorePath(slug: string): string {
  return `/store/${slug}`;
}
