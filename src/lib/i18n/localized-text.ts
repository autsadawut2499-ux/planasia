import type { Locale } from "@/lib/geo/countries";

/** Four-locale text used across UI, clarification, and generated content. */
export type LocalizedText = Record<Locale, string>;

/** Label map with guaranteed English fallback. */
export type LocalizedLabels = { en: string } & Partial<Record<Exclude<Locale, "en">, string>>;

/** Build a fully localized string set. */
export function L(en: string, th: string, hi: string, vi: string): LocalizedText {
  return { en, th, hi, vi };
}

/** Pick text for the active locale; falls back to English. */
export function pickLocalized(text: LocalizedText | LocalizedLabels, locale: Locale): string {
  if (locale !== "en" && locale in text && text[locale as keyof typeof text]) {
    return text[locale as keyof typeof text] as string;
  }
  return text.en;
}

/** Pick a catalog-style label (en/th/hi/vi objects on HOUSE_STYLES, etc.). */
export function pickLocalizedLabel(
  locale: Locale,
  labels: LocalizedLabels | Record<Locale, string>,
): string {
  return pickLocalized(labels as LocalizedLabels, locale);
}

/** BCP 47 lang attribute for `<html lang>`. */
export function localeHtmlLang(locale: Locale): string {
  const map: Record<Locale, string> = { en: "en", th: "th", hi: "hi", vi: "vi" };
  return map[locale];
}

/** Human-readable language name for AI system prompts. */
export function localeName(locale: Locale | string): string {
  const names: Record<string, string> = {
    en: "English",
    th: "Thai",
    hi: "Hindi",
    vi: "Vietnamese",
  };
  return names[locale] ?? "English";
}

/** Instruction fragment for Gemini / AI endpoints. */
export function aiRespondInLocale(locale: Locale | string): string {
  const name = localeName(locale);
  return `Respond naturally in ${name}. Use idiomatic, fluent ${name} — not word-for-word machine translation. Match local architectural and real-estate phrasing.`;
}

/** Yes/no answer detection across supported locales. */
export function isAffirmativeAnswer(value: string): boolean {
  return /^(yes|y|true|1|ใช่|มี|ยืนยัน|haan|ha|हाँ|हां|có|co|vâng|vang|đúng|dung)$/i.test(
    value.trim(),
  );
}

export function isNegativeAnswer(value: string): boolean {
  return /^(no|n|false|0|ไม่|nahi|नहीं|không|khong)$/i.test(value.trim());
}
