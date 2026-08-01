"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useApp, UI_LOCALE_META, type UiLocale } from "@/context/AppContext";
import { STOREFRONT_UI_LOCALES } from "@/lib/market/config";

interface LanguageToggleProps {
  /** Match dark headers (landing/workspace) or light (store). */
  variant?: "dark" | "light";
  className?: string;
}

/** Language switcher — full Asia UI locale list (see STOREFRONT_UI_LOCALES). */
export function LanguageToggle({ variant = "dark", className = "" }: LanguageToggleProps) {
  const { uiLocale, setUiLocale, translate } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDark = variant === "dark";

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const active = UI_LOCALE_META[uiLocale];

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={translate("language.select")}
        className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[10px] font-semibold tracking-wide transition-colors ${
          isDark
            ? "border-white/25 bg-white/10 text-white hover:bg-white/15"
            : "border-border bg-surface-raised text-[#1e3a5f] hover:text-[#1e40af]"
        }`}
      >
        <Globe className="h-3 w-3" strokeWidth={1.75} aria-hidden />
        <span>{active.short}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 max-h-80 w-52 overflow-auto rounded-xl border border-border bg-white p-1 shadow-xl"
        >
          {STOREFRONT_UI_LOCALES.map((loc) => {
            const meta = UI_LOCALE_META[loc];
            const selected = loc === uiLocale;
            return (
              <li key={loc}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setUiLocale(loc as UiLocale);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    selected
                      ? "bg-[#1e40af]/10 font-semibold text-[#1e40af]"
                      : "font-medium text-[#1e3a5f] hover:bg-surface-raised hover:text-[#1e40af]"
                  }`}
                >
                  <span className="text-base leading-none">{meta.flag}</span>
                  <span className="flex-1">
                    <span className="font-semibold">{meta.native}</span>
                    <span className="ml-1.5 text-xs font-medium text-slate-500">{meta.english}</span>
                  </span>
                  {selected && <Check className="h-4 w-4" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
