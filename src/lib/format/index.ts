import type { Locale } from "@/lib/geo/countries";
import { formatPrice as formatPriceIntl } from "@/lib/i18n";

/**
 * Shared metric + Thai-first formatting helpers. The marketplace is localized for
 * Thailand, so areas are expressed in square metres (ตร.ม. / m²) and lengths in
 * metres (m). Home, House Shop, and detail pages should all reuse these helpers.
 */

/** Extract a numeric square-metre value from a stored area string (e.g. "180 sqm"). */
export function parseAreaSqm(area: string | number | null | undefined): number | null {
  if (area == null) return null;
  if (typeof area === "number") return Number.isFinite(area) ? area : null;
  const match = area.replace(/,/g, "").match(/\d+(\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  return Number.isFinite(value) ? value : null;
}

/** Format an area as square metres, e.g. "180 ตร.ม." (th) / "180 m²" (en). */
export function formatArea(area: string | number | null | undefined, locale: Locale): string {
  const value = parseAreaSqm(area);
  if (value == null) return "—";
  const num = value.toLocaleString(locale === "th" ? "th-TH" : "en-US");
  return locale === "th" ? `${num} ตร.ม.` : `${num} m²`;
}

/** Format a length in metres, e.g. "8 ม." (th) / "8 m" (en). */
export function formatMeters(value: number | null | undefined, locale: Locale): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const num = value.toLocaleString(locale === "th" ? "th-TH" : "en-US");
  return locale === "th" ? `${num} ม.` : `${num} m`;
}

/** Currency formatting (Thai Baht for TH users). Re-exported for a single import site. */
export function formatPrice(amount: number, currency: string, locale: Locale): string {
  return formatPriceIntl(amount, currency, locale);
}
