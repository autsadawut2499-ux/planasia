/** Client-safe helpers for private asset refs (no server imports). */

export const PRIVATE_REF_PREFIX = "planasia-private://";

export function isPrivateAssetRef(value: string | null | undefined): boolean {
  return Boolean(value && value.startsWith(PRIVATE_REF_PREFIX));
}

export function toPrivateAssetRef(bucket: string, path: string): string {
  const clean = path.replace(/^\/+/, "");
  return `${PRIVATE_REF_PREFIX}${bucket}/${clean}`;
}

export function parsePrivateAssetRef(
  ref: string,
): { bucket: string; path: string } | null {
  if (!isPrivateAssetRef(ref)) return null;
  const rest = ref.slice(PRIVATE_REF_PREFIX.length);
  const slash = rest.indexOf("/");
  if (slash <= 0) return null;
  const bucket = rest.slice(0, slash);
  const path = rest.slice(slash + 1);
  if (!bucket || !path) return null;
  return { bucket, path };
}
