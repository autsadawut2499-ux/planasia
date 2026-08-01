import { isUiLocale, type Locale, type UiLocale } from "@/lib/geo/countries";

const SUPPORTED: Locale[] = ["en", "th", "hi", "vi"];

/** Map a BCP-47 browser tag to a supported interface language (or null). */
export function browserLanguageToUiLocale(langTag?: string | null): UiLocale | null {
  if (!langTag) return null;
  const primary = langTag.split("-")[0]?.toLowerCase();
  // Common aliases → our UiLocale codes.
  const alias: Record<string, UiLocale> = {
    in: "id", // legacy Indonesian tag
    tl: "fil", // Tagalog → Filipino
    fil: "fil",
    zh: "zh",
    "zh-cn": "zh",
    ja: "ja",
    jp: "ja",
    ko: "ko",
    my: "my",
    lo: "lo",
    km: "km",
    ms: "ms",
    id: "id",
  };
  if (primary && alias[primary]) return alias[primary];
  if (isUiLocale(primary)) return primary;
  return null;
}

/** First interface language matched from `navigator.languages`. */
export function detectBrowserUiLocale(): UiLocale | null {
  if (typeof navigator === "undefined") return null;
  for (const tag of navigator.languages ?? [navigator.language]) {
    const loc = browserLanguageToUiLocale(tag);
    if (loc) return loc;
  }
  return browserLanguageToUiLocale(navigator.language);
}

/** Map BCP 47 browser language to a supported app locale. */
export function browserLanguageToLocale(langTag?: string | null): Locale | null {
  if (!langTag) return null;
  const primary = langTag.split("-")[0]?.toLowerCase();
  if (primary === "th") return "th";
  if (primary === "hi") return "hi";
  if (primary === "vi") return "vi";
  if (primary === "en") return "en";
  if (SUPPORTED.includes(primary as Locale)) return primary as Locale;
  return null;
}

/** Read locale from `navigator.languages` (first supported match). */
export function detectBrowserLocale(): Locale | null {
  if (typeof navigator === "undefined") return null;
  for (const tag of navigator.languages ?? [navigator.language]) {
    const loc = browserLanguageToLocale(tag);
    if (loc) return loc;
  }
  return browserLanguageToLocale(navigator.language);
}

/** Google Cloud Translation API language codes (differ from ours for a few). */
export function localeToGoogleCode(locale: UiLocale | Locale | string): string {
  const map: Record<string, string> = {
    fil: "tl", // Google uses Tagalog code for Filipino
    zh: "zh-CN",
  };
  return map[locale] ?? locale;
}
