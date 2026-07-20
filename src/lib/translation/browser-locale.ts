import type { Locale } from "@/lib/geo/countries";

const SUPPORTED: Locale[] = ["en", "th", "hi", "vi"];

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

/** Google Cloud Translation API language codes. */
export function localeToGoogleCode(locale: Locale): string {
  return locale;
}
