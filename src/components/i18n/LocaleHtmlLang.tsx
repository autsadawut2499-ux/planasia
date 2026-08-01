"use client";

import { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { uiLocaleHtmlLang } from "@/lib/i18n/localized-text";

/** Syncs `<html lang>` with the active interface language. */
export function LocaleHtmlLang() {
  const { uiLocale } = useApp();

  useEffect(() => {
    document.documentElement.lang = uiLocaleHtmlLang(uiLocale);
  }, [uiLocale]);

  return null;
}
