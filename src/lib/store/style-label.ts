/**
 * Ensure style / category display labels start with "แบบบ้าน"
 * (e.g. "แบบบ้านโมเดิร์น", "แบบบ้าน Minimal").
 */
const PREFIX = "แบบบ้าน";

export function withBanBaanPrefix(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith(PREFIX)) return trimmed;
  // "บ้านชั้นเดียว" → "แบบบ้านชั้นเดียว"
  if (trimmed.startsWith("บ้าน")) {
    return `${PREFIX}${trimmed.slice("บ้าน".length)}`;
  }
  // Latin / digit labels keep a space: "แบบบ้าน Minimal"
  if (/^[A-Za-z0-9]/.test(trimmed)) {
    return `${PREFIX} ${trimmed}`;
  }
  return `${PREFIX}${trimmed}`;
}

/** Strip the marketing prefix for codes / auto listing names. */
export function stripBanBaanPrefix(label: string): string {
  const trimmed = label.trim();
  if (!trimmed.startsWith(PREFIX)) return trimmed;
  return trimmed.slice(PREFIX.length).trimStart();
}
