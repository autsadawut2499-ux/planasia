"use client";

import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { localeHtmlLang } from "@/lib/i18n/localized-text";

/** Syncs `<html lang>` with the active AppContext locale. */
export function LocaleHtmlLang() {
  const { locale } = useApp();

  useEffect(() => {
    document.documentElement.lang = localeHtmlLang(locale);
  }, [locale]);

  return null;
}
