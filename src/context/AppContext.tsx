"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  COUNTRIES,
  getCountryByCode,
  isUiLocale,
  uiLocaleForCountry,
  uiToContentLocale,
  type CountryConfig,
  type Locale,
  type UiLocale,
  type UnitSystem,
} from "@/lib/geo/countries";
import { detectBrowserUiLocale } from "@/lib/translation/browser-locale";
import {
  currencyForCountry,
  formatMoney as formatMoneyRaw,
  convertFromThb,
  type Currency,
} from "@/lib/currency";
import { t, type TranslationKey } from "@/lib/i18n";
import { STOREFRONT_UI_LOCALES, THAI_DOMESTIC_MARKET } from "@/lib/market/config";

/** Keep geo/browser picks inside the languages the chrome actually offers. */
function clampStorefrontUiLocale(locale: UiLocale | null | undefined): UiLocale | null {
  if (!locale || !isUiLocale(locale)) return null;
  if ((STOREFRONT_UI_LOCALES as readonly string[]).includes(locale)) return locale;
  // Domestic storefront is TH/EN only — map any other geo language to English.
  return THAI_DOMESTIC_MARKET ? "en" : locale;
}

interface AppContextValue {
  /** Content locale (en/th/hi/vi) — drives prices, AI content, PDFs. */
  locale: Locale;
  /** Interface chrome language (superset of Locale, covers all of Asia). */
  uiLocale: UiLocale;
  setUiLocale: (locale: UiLocale) => void;
  /** @deprecated use setUiLocale — kept for backward compatibility. */
  setLocale: (locale: UiLocale) => void;
  country: CountryConfig;
  setCountryCode: (code: string) => void;
  /** Raw ISO country from IP/geo — drives display/checkout currency. */
  geoCountryCode: string;
  unitSystem: UnitSystem;
  /**
   * Display currency from geo IP (not user-selectable on the storefront).
   * Mapped from visitor country (JPY, EUR, USD, THB, …).
   */
  currency: Currency;
  /** No-op on the storefront — currency follows geo detection. */
  setCurrency: (currency: Currency) => void;
  /** Format a base (THB) amount into the active display currency. */
  formatMoney: (amountThb: number) => string;
  /** Convert a base (THB) amount into the active display currency value. */
  convertPrice: (amountThb: number) => number;
  translate: (key: TranslationKey) => string;
  geoDetected: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "planasia-settings";

interface StoredSettings {
  countryCode?: string;
  /** Persisted only when the user manually picks a language. */
  uiLocale?: UiLocale;
  /** Legacy key (older builds stored `locale`). */
  locale?: UiLocale;
  /** @deprecated Manual currency is no longer used; stripped on write. */
  currency?: Currency;
}

function readStoredSettings(): StoredSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored) as StoredSettings;
  } catch {
    return {};
  }
}

function writeStoredSettings(patch: StoredSettings) {
  const current = readStoredSettings();
  const next: StoredSettings = { ...current, ...patch };
  // Currency is geo-driven only — never persist a manual override.
  delete next.currency;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Default TH to match the homepage Thai experience and avoid EN→TH chrome flicker.
  const [uiLocale, setUiLocaleState] = useState<UiLocale>("th");
  const [countryCode, setCountryCodeState] = useState("TH");
  /** Raw ISO country from IP/geo — not remapped to the store catalog country. */
  const [geoCountryCode, setGeoCountryCode] = useState("TH");
  const [geoDetected, setGeoDetected] = useState(false);

  useEffect(() => {
    const parsed = readStoredSettings();
    const storedUiLocale = isUiLocale(parsed.uiLocale)
      ? parsed.uiLocale
      : isUiLocale(parsed.locale)
        ? parsed.locale
        : null;

    // Drop legacy manual currency from storage so old THB/USD picks don't stick.
    if (parsed.currency) {
      writeStoredSettings({});
    }

    // 1) Honour an explicit manual language choice (persisted).
    if (storedUiLocale) {
      setUiLocaleState(clampStorefrontUiLocale(storedUiLocale) ?? "th");
    } else {
      // 2) Instant hint from the browser before the geo round-trip finishes.
      const browser = clampStorefrontUiLocale(detectBrowserUiLocale());
      if (browser) setUiLocaleState(browser);
    }

    if (parsed.countryCode) {
      setCountryCodeState(parsed.countryCode);
    }

    // Always geo-detect: currency (and language when not manually chosen) follow IP.
    fetch("/api/geo")
      .then((res) => res.json())
      .then(
        (data: {
          countryCode?: string;
          currency?: Currency;
          uiLocale?: string;
        }) => {
          if (data.countryCode) {
            const raw = data.countryCode.toUpperCase();
            setGeoCountryCode(raw);
            // Store catalog country only when the user has not pinned one.
            if (!parsed.countryCode) {
              setCountryCodeState(getCountryByCode(raw).code);
            }
          }
          if (!storedUiLocale) {
            const rawDetected = isUiLocale(data.uiLocale)
              ? data.uiLocale
              : uiLocaleForCountry(data.countryCode);
            const detected = clampStorefrontUiLocale(rawDetected) ?? "en";
            setUiLocaleState(detected);
          }
          setGeoDetected(true);
        },
      )
      .catch(() => setGeoDetected(true));
  }, []);

  const setUiLocale = useCallback((next: UiLocale) => {
    const clamped = clampStorefrontUiLocale(next);
    if (!clamped) return;
    setUiLocaleState(clamped);
    writeStoredSettings({ uiLocale: clamped });
  }, []);

  const setCountryCode = useCallback((code: string) => {
    setCountryCodeState(code);
    writeStoredSettings({ countryCode: code });
  }, []);

  /** Manual currency switching is disabled on the storefront. */
  const setCurrency = useCallback((_next: Currency) => {
    /* no-op — display currency follows geo IP country */
  }, []);

  const country = useMemo(
    () => getCountryByCode(THAI_DOMESTIC_MARKET ? "TH" : countryCode),
    [countryCode],
  );
  const locale = useMemo<Locale>(() => uiToContentLocale(uiLocale), [uiLocale]);
  // Visitor origin (geo IP) → local display currency; unknown → THB.
  const currency: Currency = currencyForCountry(geoCountryCode);

  const value = useMemo<AppContextValue>(
    () => ({
      locale,
      uiLocale,
      setUiLocale,
      setLocale: setUiLocale,
      country,
      setCountryCode,
      geoCountryCode,
      unitSystem: country.unitSystem,
      currency,
      setCurrency,
      formatMoney: (amountThb) => formatMoneyRaw(amountThb, currency),
      convertPrice: (amountThb) => convertFromThb(amountThb, currency),
      translate: (key) => t(uiLocale, key),
      geoDetected,
    }),
    [
      locale,
      uiLocale,
      setUiLocale,
      country,
      setCountryCode,
      geoCountryCode,
      currency,
      setCurrency,
      geoDetected,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { COUNTRIES, LOCALE_LABELS, UI_LOCALES, UI_LOCALE_META } from "@/lib/geo/countries";
export type { Locale, UiLocale } from "@/lib/geo/countries";
export { CURRENCY_META, USD_THB_RATE } from "@/lib/currency";
export type { Currency } from "@/lib/currency";
