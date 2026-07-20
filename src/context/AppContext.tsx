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
  type CountryConfig,
  type Locale,
  type UnitSystem,
} from "@/lib/geo/countries";
import { detectBrowserLocale } from "@/lib/translation/browser-locale";
import { t, type TranslationKey } from "@/lib/i18n";

interface AppContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  country: CountryConfig;
  setCountryCode: (code: string) => void;
  unitSystem: UnitSystem;
  translate: (key: TranslationKey) => string;
  geoDetected: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = "planasia-settings";

interface StoredSettings {
  locale?: Locale;
  countryCode?: string;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [countryCode, setCountryCodeState] = useState("TH");
  const [geoDetected, setGeoDetected] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed: StoredSettings = JSON.parse(stored);
        if (parsed.locale) setLocaleState(parsed.locale);
        if (parsed.countryCode) setCountryCodeState(parsed.countryCode);
        setGeoDetected(true);
        return;
      } catch {
        /* ignore */
      }
    }

    fetch("/api/geo")
      .then((res) => res.json())
      .then((data: { countryCode?: string; locale?: Locale }) => {
        const browserLocale = detectBrowserLocale();
        if (data.countryCode) {
          const country = getCountryByCode(data.countryCode);
          setCountryCodeState(country.code);
          setLocaleState(browserLocale ?? data.locale ?? country.defaultLocale);
        } else if (browserLocale) {
          setLocaleState(browserLocale);
        }
        setGeoDetected(true);
      })
      .catch(() => {
        const browserLocale = detectBrowserLocale();
        if (browserLocale) setLocaleState(browserLocale);
        setGeoDetected(true);
      });
  }, []);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ locale: next, countryCode }),
      );
    },
    [countryCode],
  );

  const setCountryCode = useCallback(
    (code: string) => {
      const country = getCountryByCode(code);
      setCountryCodeState(code);
      setLocaleState(country.defaultLocale);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ locale: country.defaultLocale, countryCode: code }),
      );
    },
    [],
  );

  const country = useMemo(() => getCountryByCode(countryCode), [countryCode]);

  const value = useMemo<AppContextValue>(
    () => ({
      locale,
      setLocale,
      country,
      setCountryCode,
      unitSystem: country.unitSystem,
      translate: (key) => t(locale, key),
      geoDetected,
    }),
    [locale, setLocale, country, setCountryCode, geoDetected],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export { COUNTRIES, LOCALE_LABELS } from "@/lib/geo/countries";
export type { Locale } from "@/lib/geo/countries";
