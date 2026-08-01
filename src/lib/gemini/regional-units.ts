/**
 * Authoritative country ↔ unit pairing for Gemini regional context.
 * `target_country` resolves to this profile; never invent units outside the list.
 */

/** Thai labels used in the market unit table (source of truth for AI copy). */
export type MarketUnitLabel =
  | "เมตร"
  | "เซนติเมตร"
  | "มิลลิเมตร"
  | "ฟุต"
  | "นิ้ว";

export interface CountryUnitProfile {
  /** Display name in Thai (as provided by product). */
  country: string;
  /** Allowed linear units for this market (order = preference). */
  units: readonly MarketUnitLabel[];
}

/**
 * Coupled market table — keys are ISO country codes.
 * Keep in sync with product brief; do not add ad-hoc units per call site.
 */
export const GEMINI_COUNTRY_UNIT_MAP = {
  TH: { country: "ประเทศไทย", units: ["เมตร", "เซนติเมตร", "มิลลิเมตร"] },
  LA: { country: "ประเทศลาว", units: ["เมตร", "มิลลิเมตร"] },
  KH: { country: "ประเทศกัมพูชา", units: ["เมตร", "มิลลิเมตร"] },
  VN: { country: "ประเทศเวียดนาม", units: ["เมตร", "มิลลิเมตร"] },
  MM: { country: "ประเทศพม่า", units: ["ฟุต", "นิ้ว"] },
  ID: { country: "ประเทศอินโดนีเซีย", units: ["เมตร", "มิลลิเมตร"] },
  PH: { country: "ประเทศฟิลิปปินส์", units: ["ฟุต", "นิ้ว"] },
  CN: { country: "ประเทศจีน", units: ["เมตร", "มิลลิเมตร"] },
  IN: { country: "ประเทศอินเดีย", units: ["ฟุต", "นิ้ว"] },
  BD: { country: "ประเทศบังกลาเทศ", units: ["ฟุต", "นิ้ว"] },
  MY: { country: "ประเทศมาเลเซีย", units: ["เมตร", "มิลลิเมตร"] },
  SG: { country: "ประเทศสิงคโปร์", units: ["เมตร", "มิลลิเมตร"] },
  TW: { country: "ประเทศไต้หวัน", units: ["เมตร", "มิลลิเมตร"] },
  JP: { country: "ประเทศญี่ปุ่น", units: ["มิลลิเมตร"] },
  KR: { country: "ประเทศเกาหลีใต้", units: ["เมตร", "มิลลิเมตร"] },
  BN: { country: "ประเทศบรูไน", units: ["เมตร", "มิลลิเมตร"] },
  PK: { country: "ประเทศปากีสถาน", units: ["ฟุต", "นิ้ว"] },
  AE: { country: "ประเทศสหรัฐอาหรับเอมิเรตส์", units: ["เมตร", "มิลลิเมตร"] },
  SA: { country: "ประเทศซาอุดีอาระเบีย", units: ["เมตร", "มิลลิเมตร"] },
} as const satisfies Record<string, CountryUnitProfile>;

export type GeminiMarketCountryCode = keyof typeof GEMINI_COUNTRY_UNIT_MAP;

export const GEMINI_MARKET_COUNTRY_CODES = Object.keys(
  GEMINI_COUNTRY_UNIT_MAP,
) as GeminiMarketCountryCode[];

export function isGeminiMarketCountryCode(
  code: string | null | undefined,
): code is GeminiMarketCountryCode {
  if (!code) return false;
  return code.toUpperCase() in GEMINI_COUNTRY_UNIT_MAP;
}

export function getCountryUnitProfile(
  code: string,
): CountryUnitProfile & { code: GeminiMarketCountryCode } {
  const key = code.toUpperCase() as GeminiMarketCountryCode;
  const profile = GEMINI_COUNTRY_UNIT_MAP[key] ?? GEMINI_COUNTRY_UNIT_MAP.TH;
  const resolved = (GEMINI_COUNTRY_UNIT_MAP[key] ? key : "TH") as GeminiMarketCountryCode;
  return { code: resolved, country: profile.country, units: profile.units };
}

/** Imperial markets use feet/inches; everyone else is metric (incl. JP mm-only). */
export function isImperialUnitList(units: readonly string[]): boolean {
  return units.includes("ฟุต") || units.includes("นิ้ว");
}

/** English labels for the checkout country dropdown. */
const MARKET_COUNTRY_NAME_EN: Record<GeminiMarketCountryCode, string> = {
  TH: "Thailand",
  LA: "Laos",
  KH: "Cambodia",
  VN: "Vietnam",
  MM: "Myanmar",
  ID: "Indonesia",
  PH: "Philippines",
  CN: "China",
  IN: "India",
  BD: "Bangladesh",
  MY: "Malaysia",
  SG: "Singapore",
  TW: "Taiwan",
  JP: "Japan",
  KR: "South Korea",
  BN: "Brunei",
  PK: "Pakistan",
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
};

export interface GeminiMarketCountryOption {
  code: GeminiMarketCountryCode;
  nameTh: string;
  nameEn: string;
  units: readonly MarketUnitLabel[];
  unitsLabel: string;
}

/** Options for the pre-checkout target-country dropdown. */
export function listGeminiMarketCountryOptions(): GeminiMarketCountryOption[] {
  return GEMINI_MARKET_COUNTRY_CODES.map((code) => {
    const profile = GEMINI_COUNTRY_UNIT_MAP[code];
    return {
      code,
      nameTh: profile.country,
      nameEn: MARKET_COUNTRY_NAME_EN[code],
      units: profile.units,
      unitsLabel: profile.units.join(" / "),
    };
  });
}

/** Resolve a geo/IP country into a Gemini market code (fallback TH). */
export function resolveGeminiMarketCountry(
  code: string | null | undefined,
): GeminiMarketCountryCode {
  if (isGeminiMarketCountryCode(code)) return code.toUpperCase() as GeminiMarketCountryCode;
  return "TH";
}
