"use client";

import { useApp } from "@/context/AppContext";

/**
 * Lightweight EN/TH helper for landing-page marketing copy. Nav labels and other
 * reusable strings live in the shared i18n dictionary; long-form section copy that
 * is unique to the home page uses this helper to stay bilingual without bloating
 * the global translation table. Non-en/th locales fall back to English (matching
 * the global `t()` fallback behaviour).
 */
export function useBilingual() {
  const { locale } = useApp();
  return (en: string, th: string) => (locale === "th" ? th : en);
}
