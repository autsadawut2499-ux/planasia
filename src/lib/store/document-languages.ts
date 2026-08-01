/**
 * Document package language for purchased house plans (PDF stamps / localization).
 * Separate from UI chrome language (`UiLocale`).
 *
 * Pre-checkout no longer shows a language grid — buyers pick a target country,
 * and foreign markets pay a flat localization fee (see localizationSurchargeThb).
 */

import { USD_THB_RATE } from "@/lib/currency";

/**
 * Legacy language-grid picker. Keep `false` — country dropdown drives localization.
 */
export const DOCUMENT_LANGUAGE_PICKER_ENABLED = false;

/** Flat fee for any non-Thailand target country (units + translation). */
export const FOREIGN_LOCALIZATION_FEE_USD = 10;
export const FOREIGN_LOCALIZATION_FEE_THB = FOREIGN_LOCALIZATION_FEE_USD * USD_THB_RATE;

export type DocumentLanguage =
  | "th"
  | "en"
  | "lo"
  | "km"
  | "vi"
  | "my"
  | "id"
  | "zh"
  | "hi"
  | "es"
  | "pt"
  | "fr"
  | "ar"
  | "bn"
  | "tl";

export interface DocumentLanguageOption {
  code: DocumentLanguage;
  /** ISO-style short label shown in the picker. */
  short: string;
  /** English name. */
  nameEn: string;
  /** Thai helper label. */
  nameTh: string;
  /** Market note (EN). */
  noteEn: string;
  noteTh: string;
  /** Localization surcharge in THB (0 = included in base plan price). */
  surchargeThb: number;
}

/**
 * TH/EN included. ASEAN neighbors + TL: ฿190. Global markets: ฿390.
 * Recalculates instantly in pre-checkout.
 */
export const DOCUMENT_LANGUAGES: readonly DocumentLanguageOption[] = [
  {
    code: "th",
    short: "TH",
    nameEn: "Thai",
    nameTh: "ไทย",
    noteEn: "Source origin",
    noteTh: "ภาษาต้นทาง",
    surchargeThb: 0,
  },
  {
    code: "en",
    short: "EN",
    nameEn: "English",
    nameTh: "อังกฤษ",
    noteEn: "Global / Philippines / Africa",
    noteTh: "ตลาดโลก / ฟิลิปปินส์ / แอฟริกา",
    surchargeThb: 0,
  },
  {
    code: "lo",
    short: "LO",
    nameEn: "Lao",
    nameTh: "ลาว",
    noteEn: "Core neighboring country",
    noteTh: "ประเทศเพื่อนบ้านหลัก",
    surchargeThb: 190,
  },
  {
    code: "km",
    short: "KM",
    nameEn: "Khmer",
    nameTh: "เขมร",
    noteEn: "Core neighboring country",
    noteTh: "ประเทศเพื่อนบ้านหลัก",
    surchargeThb: 190,
  },
  {
    code: "vi",
    short: "VI",
    nameEn: "Vietnamese",
    nameTh: "เวียดนาม",
    noteEn: "Fast-growing market",
    noteTh: "ตลาดเติบโตเร็ว",
    surchargeThb: 190,
  },
  {
    code: "my",
    short: "MY",
    nameEn: "Burmese",
    nameTh: "พม่า",
    noteEn: "Construction market similar to Thailand",
    noteTh: "ตลาดก่อสร้างใกล้เคียงไทย",
    surchargeThb: 190,
  },
  {
    code: "id",
    short: "ID",
    nameEn: "Indonesian",
    nameTh: "อินโดนีเซีย",
    noteEn: "Largest population in ASEAN",
    noteTh: "ประชากรใหญ่สุดในอาเซียน",
    surchargeThb: 190,
  },
  {
    code: "tl",
    short: "TL",
    nameEn: "Tagalog",
    nameTh: "ตากาล็อก",
    noteEn: "Philippines (local focus)",
    noteTh: "ฟิลิปปินส์ (โฟกัสท้องถิ่น)",
    surchargeThb: 190,
  },
  {
    code: "zh",
    short: "ZH",
    nameEn: "Chinese",
    nameTh: "จีน",
    noteEn: "Investor market",
    noteTh: "ตลาดนักลงทุน",
    surchargeThb: 390,
  },
  {
    code: "hi",
    short: "HI",
    nameEn: "Hindi",
    nameTh: "ฮินดี",
    noteEn: "India (massive volume)",
    noteTh: "อินเดีย (ปริมาณสูง)",
    surchargeThb: 390,
  },
  {
    code: "es",
    short: "ES",
    nameEn: "Spanish",
    nameTh: "สเปน",
    noteEn: "South America",
    noteTh: "อเมริกาใต้",
    surchargeThb: 390,
  },
  {
    code: "pt",
    short: "PT",
    nameEn: "Portuguese",
    nameTh: "โปรตุเกส",
    noteEn: "Brazil",
    noteTh: "บราซิล",
    surchargeThb: 390,
  },
  {
    code: "fr",
    short: "FR",
    nameEn: "French",
    nameTh: "ฝรั่งเศส",
    noteEn: "Africa",
    noteTh: "แอฟริกา",
    surchargeThb: 390,
  },
  {
    code: "ar",
    short: "AR",
    nameEn: "Arabic",
    nameTh: "อาหรับ",
    noteEn: "Middle East / North Africa",
    noteTh: "ตะวันออกกลาง / แอฟริกาเหนือ",
    surchargeThb: 390,
  },
  {
    code: "bn",
    short: "BN",
    nameEn: "Bengali",
    nameTh: "เบงกาลี",
    noteEn: "Bangladesh",
    noteTh: "บังกลาเทศ",
    surchargeThb: 390,
  },
] as const;

const BY_CODE = Object.fromEntries(
  DOCUMENT_LANGUAGES.map((l) => [l.code, l]),
) as Record<DocumentLanguage, DocumentLanguageOption>;

export function isDocumentLanguage(value: unknown): value is DocumentLanguage {
  return typeof value === "string" && value in BY_CODE;
}

export function getDocumentLanguage(code: DocumentLanguage): DocumentLanguageOption {
  return BY_CODE[code] ?? BY_CODE.th;
}

/** @deprecated Prefer localizationSurchargeThb(targetCountry). */
export function documentLanguageSurcharge(code: DocumentLanguage): number {
  return getDocumentLanguage(code).surchargeThb;
}

/**
 * Flat localization fee in base THB: ฿0 for Thailand, otherwise $10 (= ฿350).
 */
export function localizationSurchargeThb(targetCountry: string | null | undefined): number {
  const code = (targetCountry ?? "TH").toUpperCase();
  return code === "TH" ? 0 : FOREIGN_LOCALIZATION_FEE_THB;
}

/** Infer package language from the buyer's target country (no language grid). */
export function documentLanguageFromTargetCountry(
  targetCountry: string | null | undefined,
): DocumentLanguage {
  switch ((targetCountry ?? "TH").toUpperCase()) {
    case "TH":
      return "th";
    case "VN":
      return "vi";
    case "IN":
      return "hi";
    case "LA":
      return "lo";
    case "KH":
      return "km";
    case "MM":
      return "my";
    case "ID":
      return "id";
    case "PH":
      return "tl";
    case "CN":
    case "TW":
    case "HK":
      return "zh";
    default:
      return "en";
  }
}

/** Map document language → download/stamp locale (closest supported). */
export function documentLanguageToStampLocale(
  code: DocumentLanguage,
): "en" | "th" | "hi" | "vi" {
  if (code === "th") return "th";
  if (code === "hi") return "hi";
  if (code === "vi") return "vi";
  return "en";
}

export function defaultDocumentLanguage(uiLocale?: string): DocumentLanguage {
  if (!DOCUMENT_LANGUAGE_PICKER_ENABLED) return "th";
  if (isDocumentLanguage(uiLocale)) return uiLocale;
  if (uiLocale === "fil") return "tl";
  return "en";
}

/**
 * Resolve document language for checkout.
 * When the language grid is off, language follows `targetCountry`.
 */
export function resolveCheckoutDocumentLanguage(
  value: unknown,
  targetCountry?: string | null,
): DocumentLanguage {
  if (!DOCUMENT_LANGUAGE_PICKER_ENABLED) {
    return documentLanguageFromTargetCountry(targetCountry);
  }
  if (isDocumentLanguage(value)) return value;
  return documentLanguageFromTargetCountry(targetCountry);
}
