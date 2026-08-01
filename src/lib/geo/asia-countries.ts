/**
 * Pan-Asia country list. The marketplace serves buyers and draftsmen across the
 * whole continent, so KYC (country of document issue) and vendor profiles need
 * a broad list — wider than the store's currency/locale COUNTRIES config.
 */

export interface AsiaCountry {
  code: string; // ISO 3166-1 alpha-2
  en: string;
  th: string;
  flag: string;
}

export const ASIA_COUNTRIES: AsiaCountry[] = [
  { code: "TH", en: "Thailand", th: "ไทย", flag: "🇹🇭" },
  { code: "VN", en: "Vietnam", th: "เวียดนาม", flag: "🇻🇳" },
  { code: "ID", en: "Indonesia", th: "อินโดนีเซีย", flag: "🇮🇩" },
  { code: "MY", en: "Malaysia", th: "มาเลเซีย", flag: "🇲🇾" },
  { code: "SG", en: "Singapore", th: "สิงคโปร์", flag: "🇸🇬" },
  { code: "PH", en: "Philippines", th: "ฟิลิปปินส์", flag: "🇵🇭" },
  { code: "MM", en: "Myanmar", th: "เมียนมา", flag: "🇲🇲" },
  { code: "KH", en: "Cambodia", th: "กัมพูชา", flag: "🇰🇭" },
  { code: "LA", en: "Laos", th: "ลาว", flag: "🇱🇦" },
  { code: "BN", en: "Brunei", th: "บรูไน", flag: "🇧🇳" },
  { code: "IN", en: "India", th: "อินเดีย", flag: "🇮🇳" },
  { code: "BD", en: "Bangladesh", th: "บังกลาเทศ", flag: "🇧🇩" },
  { code: "PK", en: "Pakistan", th: "ปากีสถาน", flag: "🇵🇰" },
  { code: "LK", en: "Sri Lanka", th: "ศรีลังกา", flag: "🇱🇰" },
  { code: "NP", en: "Nepal", th: "เนปาล", flag: "🇳🇵" },
  { code: "BT", en: "Bhutan", th: "ภูฏาน", flag: "🇧🇹" },
  { code: "CN", en: "China", th: "จีน", flag: "🇨🇳" },
  { code: "HK", en: "Hong Kong", th: "ฮ่องกง", flag: "🇭🇰" },
  { code: "TW", en: "Taiwan", th: "ไต้หวัน", flag: "🇹🇼" },
  { code: "JP", en: "Japan", th: "ญี่ปุ่น", flag: "🇯🇵" },
  { code: "KR", en: "South Korea", th: "เกาหลีใต้", flag: "🇰🇷" },
  { code: "MN", en: "Mongolia", th: "มองโกเลีย", flag: "🇲🇳" },
  { code: "AE", en: "United Arab Emirates", th: "สหรัฐอาหรับเอมิเรตส์", flag: "🇦🇪" },
  { code: "SA", en: "Saudi Arabia", th: "ซาอุดีอาระเบีย", flag: "🇸🇦" },
  { code: "QA", en: "Qatar", th: "กาตาร์", flag: "🇶🇦" },
  { code: "KW", en: "Kuwait", th: "คูเวต", flag: "🇰🇼" },
  { code: "BH", en: "Bahrain", th: "บาห์เรน", flag: "🇧🇭" },
  { code: "OM", en: "Oman", th: "โอมาน", flag: "🇴🇲" },
  { code: "KZ", en: "Kazakhstan", th: "คาซัคสถาน", flag: "🇰🇿" },
  { code: "UZ", en: "Uzbekistan", th: "อุซเบกิสถาน", flag: "🇺🇿" },
];

export function getAsiaCountry(code: string): AsiaCountry | undefined {
  return ASIA_COUNTRIES.find((c) => c.code === code);
}

export function asiaCountryLabel(code: string | undefined, locale: "en" | "th" = "th"): string {
  if (!code) return "";
  const c = getAsiaCountry(code);
  if (!c) return code;
  return `${c.flag} ${locale === "th" ? c.th : c.en}`;
}
