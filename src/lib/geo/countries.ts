/**
 * Content locale — languages with a full data set (UI strings, AI generation,
 * PDF, legal, cost references). Kept small on purpose.
 */
export type Locale = "en" | "th" | "hi" | "vi";

/**
 * UI locale — the interface chrome language shown to the visitor. Superset of
 * `Locale` so we can serve the whole of Asia. Languages without a full
 * dictionary automatically fall back to English strings (see i18n `t()`), and
 * map to a content `Locale` for prices / AI content via `uiToContentLocale`.
 */
export type UiLocale =
  | "en"
  | "th"
  | "vi"
  | "hi"
  | "id"
  | "ms"
  | "fil"
  | "my"
  | "lo"
  | "km"
  | "zh"
  | "ja"
  | "ko";

export type UnitSystem = "metric" | "imperial";

export interface CountryConfig {
  code: string;
  name: Record<Locale, string>;
  defaultLocale: Locale;
  unitSystem: UnitSystem;
  currency: string;
  buildingCode: string;
}

export const COUNTRIES: CountryConfig[] = [
  {
    code: "TH",
    name: { en: "Thailand", th: "ประเทศไทย", hi: "थाईलैंड", vi: "Thái Lan" },
    defaultLocale: "th",
    unitSystem: "metric",
    currency: "THB",
    buildingCode: "กฎกระทรวงฉบับที่ 10 (พ.ศ. 2528)",
  },
  {
    code: "IN",
    name: { en: "India", th: "อินเดีย", hi: "भारत", vi: "Ấn Độ" },
    defaultLocale: "hi",
    unitSystem: "metric",
    currency: "INR",
    buildingCode: "National Building Code of India 2016",
  },
  {
    code: "VN",
    name: { en: "Vietnam", th: "เวียดนาม", hi: "वियतनाम", vi: "Việt Nam" },
    defaultLocale: "vi",
    unitSystem: "metric",
    currency: "VND",
    buildingCode: "QCVN 06:2022/BXD",
  },
  {
    code: "MY",
    name: { en: "Malaysia", th: "มาเลเซีย", hi: "मलेशिया", vi: "Malaysia" },
    defaultLocale: "en",
    unitSystem: "metric",
    currency: "MYR",
    buildingCode: "Uniform Building By-Laws (UBBL)",
  },
  {
    code: "ID",
    name: { en: "Indonesia", th: "อินโดนีเซีย", hi: "इंडोनेशिया", vi: "Indonesia" },
    defaultLocale: "en",
    unitSystem: "metric",
    currency: "IDR",
    buildingCode: "Permen PUPR No. 27/PRT/M/2018",
  },
  {
    code: "US",
    name: { en: "United States", th: "สหรัฐอเมริกา", hi: "संयुक्त राज्य", vi: "Hoa Kỳ" },
    defaultLocale: "en",
    unitSystem: "imperial",
    currency: "USD",
    buildingCode: "IRC / IBC",
  },
];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  th: "ไทย",
  hi: "हिन्दी",
  vi: "Tiếng Việt",
};

export interface UiLocaleMeta {
  /** Endonym (name of the language in its own script). */
  native: string;
  english: string;
  short: string;
  /** BCP-47 tag for the <html lang> attribute. */
  htmlLang: string;
  flag: string;
  /** Content locale used for prices / AI content (full data only for en/th/hi/vi). */
  content: Locale;
}

/** Metadata for every selectable interface language. */
export const UI_LOCALE_META: Record<UiLocale, UiLocaleMeta> = {
  en: { native: "English", english: "English", short: "EN", htmlLang: "en", flag: "🇬🇧", content: "en" },
  th: { native: "ไทย", english: "Thai", short: "TH", htmlLang: "th", flag: "🇹🇭", content: "th" },
  vi: { native: "Tiếng Việt", english: "Vietnamese", short: "VI", htmlLang: "vi", flag: "🇻🇳", content: "vi" },
  hi: { native: "हिन्दी", english: "Hindi", short: "HI", htmlLang: "hi", flag: "🇮🇳", content: "hi" },
  id: { native: "Bahasa Indonesia", english: "Indonesian", short: "ID", htmlLang: "id", flag: "🇮🇩", content: "en" },
  ms: { native: "Bahasa Melayu", english: "Malay", short: "MS", htmlLang: "ms", flag: "🇲🇾", content: "en" },
  fil: { native: "Filipino", english: "Filipino", short: "FIL", htmlLang: "fil", flag: "🇵🇭", content: "en" },
  my: { native: "မြန်မာ", english: "Burmese", short: "MY", htmlLang: "my", flag: "🇲🇲", content: "en" },
  lo: { native: "ລາວ", english: "Lao", short: "LO", htmlLang: "lo", flag: "🇱🇦", content: "en" },
  km: { native: "ខ្មែរ", english: "Khmer", short: "KM", htmlLang: "km", flag: "🇰🇭", content: "en" },
  zh: { native: "中文", english: "Chinese", short: "ZH", htmlLang: "zh", flag: "🇨🇳", content: "en" },
  ja: { native: "日本語", english: "Japanese", short: "JA", htmlLang: "ja", flag: "🇯🇵", content: "en" },
  ko: { native: "한국어", english: "Korean", short: "KO", htmlLang: "ko", flag: "🇰🇷", content: "en" },
};

/** Display order for the language switcher. */
export const UI_LOCALES: readonly UiLocale[] = [
  "en", "th", "vi", "id", "ms", "fil", "my", "lo", "km", "hi", "zh", "ja", "ko",
];

export function isUiLocale(value: unknown): value is UiLocale {
  return typeof value === "string" && value in UI_LOCALE_META;
}

/** Map an interface language back to a content locale for prices / AI content. */
export function uiToContentLocale(ui: UiLocale): Locale {
  return UI_LOCALE_META[ui]?.content ?? "en";
}

/** Country → default interface language, used by geo auto-detection. */
export const COUNTRY_UI_LOCALE: Record<string, UiLocale> = {
  TH: "th",
  VN: "vi",
  LA: "lo",
  KH: "km",
  MM: "my",
  MY: "ms",
  BN: "ms",
  SG: "en",
  ID: "id",
  PH: "fil",
  IN: "hi",
  NP: "hi",
  BD: "en",
  PK: "en",
  LK: "en",
  BT: "en",
  CN: "zh",
  HK: "zh",
  TW: "zh",
  JP: "ja",
  KR: "ko",
  MN: "en",
  US: "en",
};

/** Resolve the best interface language for a detected country code. */
export function uiLocaleForCountry(code: string | undefined | null): UiLocale {
  if (!code) return "en";
  return COUNTRY_UI_LOCALE[code.toUpperCase()] ?? "en";
}

export function getCountryByCode(code: string): CountryConfig {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

export function formatDimension(valueMeters: number, unitSystem: UnitSystem): string {
  if (unitSystem === "metric") {
    return `${valueMeters.toFixed(2)} m`;
  }
  const feet = valueMeters * 3.28084;
  const wholeFeet = Math.floor(feet);
  const inches = Math.round((feet - wholeFeet) * 12);
  return `${wholeFeet}'-${inches}"`;
}

export const HOUSE_STYLES = [
  { id: "minimal", label: { en: "แบบบ้าน Minimal", th: "แบบบ้านมินิมอล", hi: "แบบบ้าน मिनिमल", vi: "แบบบ้าน Tối giản" } },
  { id: "modern", label: { en: "แบบบ้าน Modern", th: "แบบบ้านโมเดิร์น", hi: "แบบบ้าน आधुनिक", vi: "แบบบ้าน Hiện đại" } },
  { id: "loft", label: { en: "แบบบ้าน Loft", th: "แบบบ้านลอฟท์", hi: "แบบบ้าน लॉफ्ट", vi: "แบบบ้าน Loft" } },
  { id: "nordic", label: { en: "แบบบ้าน Nordic", th: "แบบบ้านนอร์ดิก", hi: "แบบบ้าน नॉर्डिक", vi: "แบบบ้าน Bắc Âu" } },
  { id: "contemporary", label: { en: "แบบบ้าน Contemporary", th: "แบบบ้านร่วมสมัย", hi: "แบบบ้าน समकालीन", vi: "แบบบ้าน Đương đại" } },
  { id: "tropical", label: { en: "แบบบ้าน Tropical", th: "แบบบ้านทรอปิคอล", hi: "แบบบ้าน उष्णकटिबंधीय", vi: "แบบบ้าน Nhiệt đới" } },
  { id: "industrial", label: { en: "แบบบ้าน Industrial", th: "แบบบ้านอินดัสเทรียล", hi: "แบบบ้าน औद्योगिक", vi: "แบบบ้าน Công nghiệp" } },
  { id: "japanese", label: { en: "แบบบ้าน Japanese", th: "แบบบ้านญี่ปุ่น", hi: "แบบบ้าน जापानी", vi: "แบบบ้าน Nhật Bản" } },
  { id: "scandinavian", label: { en: "แบบบ้าน Scandinavian", th: "แบบบ้านสแกนดินาเวีย", hi: "แบบบ้าน स्कैंडिनेवियाई", vi: "แบบบ้าน Scandinavia" } },
  { id: "tropical-minimal", label: { en: "แบบบ้าน Tropical Minimal", th: "แบบบ้านทรอปิคอล มินิมอล", hi: "แบบบ้าน उष्णकटिबंधीय मिनिमल", vi: "แบบบ้าน Nhiệt đới tối giản" } },
] as const;

export const PRICING = {
  store: { pdf: 1000, cad: 1000 },
  custom: {
    pdf: { "1": 1990, "2": 2990 },
    cad: 4990,
  },
} as const;
