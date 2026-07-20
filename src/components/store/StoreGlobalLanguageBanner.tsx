"use client";

import { Globe, Languages, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useApp, LOCALE_LABELS, type Locale } from "@/context/AppContext";

const GLOBAL_TAGLINE =
  "Supports all languages · รองรับทุกภาษา · 多语言支持 · सभी भाषाएँ · Mọi ngôn ngữ";

export function StoreGlobalLanguageBanner() {
  const { locale, setLocale, translate } = useApp();
  const [translationActive, setTranslationActive] = useState(false);

  useEffect(() => {
    void fetch("/api/translate")
      .then((r) => r.json())
      .then((data: { configured?: boolean }) => setTranslationActive(Boolean(data.configured)))
      .catch(() => setTranslationActive(false));
  }, []);

  return (
    <div
      className="border-b border-[#1e40af]/15 bg-gradient-to-r from-[#eff6ff] via-white to-[#eef2ff]"
      role="region"
      aria-label={translate("store.globalBanner.aria")}
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e40af]/10 text-[#1e40af]">
            <Globe className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-[#1e3a5f]">
                {translate("store.globalBanner.title")}
              </p>
              {translationActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                  <Sparkles className="h-3 w-3" />
                  {translate("store.globalBanner.aiActive")}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">
              {translate("store.globalBanner.subtitle")}
            </p>
            <p className="mt-1 hidden text-[11px] text-text-muted sm:block">{GLOBAL_TAGLINE}</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            <Languages className="h-3.5 w-3.5" />
            {translate("store.globalBanner.switchLabel")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setLocale(loc)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  locale === loc
                    ? "border-[#1e40af] bg-[#1e40af] text-white shadow-sm"
                    : "border-border bg-white text-text-secondary hover:border-[#1e40af]/40 hover:text-[#1e40af]"
                }`}
                aria-pressed={locale === loc}
              >
                {LOCALE_LABELS[loc]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
