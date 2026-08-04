/**
 * Style labels (architectural look) — "แบบบ้านโมเดิร์น", "แบบบ้าน Minimal".
 * Do NOT use this for Collections / building types (โกดัง, อาคารพาณิชย์, …).
 */
const HOUSE_STYLE_PREFIX = "แบบบ้าน";

export function withBanBaanPrefix(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith(HOUSE_STYLE_PREFIX)) return trimmed;
  // "บ้านชั้นเดียว" as a style-ish label → "แบบบ้านชั้นเดียว"
  if (trimmed.startsWith("บ้าน")) {
    return `${HOUSE_STYLE_PREFIX}${trimmed.slice("บ้าน".length)}`;
  }
  // Latin / digit labels keep a space: "แบบบ้าน Minimal"
  if (/^[A-Za-z0-9]/.test(trimmed)) {
    return `${HOUSE_STYLE_PREFIX} ${trimmed}`;
  }
  return `${HOUSE_STYLE_PREFIX}${trimmed}`;
}

/** Strip the marketing prefix for codes / auto listing names. */
export function stripBanBaanPrefix(label: string): string {
  const trimmed = label.trim();
  if (!trimmed.startsWith(HOUSE_STYLE_PREFIX)) return trimmed;
  return trimmed.slice(HOUSE_STYLE_PREFIX.length).trimStart();
}

/**
 * Collection / building-type Thai labels.
 * - Houses: "บ้านชั้นเดียว" → "แบบบ้านชั้นเดียว"
 * - Other buildings: "โกดัง" → "แบบโกดัง", "อาคารพาณิชย์" → "แบบอาคารพาณิชย์"
 * Never force "แบบบ้าน" onto warehouses, commercial, resort, etc.
 */
export function formatCollectionTitleTh(label: string): string {
  let t = label.trim();
  if (!t) return t;
  // Undo mistaken "แบบบ้านโกดัง" / "แบบบ้านอาคารพาณิชย์"
  if (t.startsWith(HOUSE_STYLE_PREFIX)) {
    t = t.slice(HOUSE_STYLE_PREFIX.length).trimStart();
  } else if (t.startsWith("แบบ")) {
    t = t.slice("แบบ".length).trimStart();
  }
  if (!t) return t;
  // Residential types already start with บ้าน → แบบบ้าน…
  if (t.startsWith("บ้าน")) return `แบบ${t}`;
  return `แบบ${t}`;
}

/** Collection English labels — plain type names, no forced "House Plan" prefix. */
export function formatCollectionTitleEn(label: string): string {
  return label
    .trim()
    .replace(/^แบบบ้าน\s*/u, "")
    .replace(/^แบบ\s*/u, "")
    .replace(/^House\s*Plan(s)?\s+/i, "")
    .trim();
}
