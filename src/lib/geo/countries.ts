export type Locale = "en" | "th" | "hi" | "vi";

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
  { id: "minimal", label: { en: "Minimal", th: "มินิมอล", hi: "मिनिमल", vi: "Tối giản" } },
  { id: "modern", label: { en: "Modern", th: "โมเดิร์น", hi: "आधुनिक", vi: "Hiện đại" } },
  { id: "loft", label: { en: "Loft", th: "ลอฟท์", hi: "लॉफ्ट", vi: "Loft" } },
  { id: "nordic", label: { en: "Nordic", th: "นอร์ดิก", hi: "नॉर्डिक", vi: "Bắc Âu" } },
  { id: "contemporary", label: { en: "Contemporary", th: "ร่วมสมัย", hi: "समकालीन", vi: "Đương đại" } },
  { id: "tropical", label: { en: "Tropical", th: "โทรปิคัล", hi: "उष्णकटिबंधीय", vi: "Nhiệt đới" } },
  { id: "industrial", label: { en: "Industrial", th: "อินดัสเทรียล", hi: "औद्योगिक", vi: "Công nghiệp" } },
  { id: "japanese", label: { en: "Japanese", th: "ญี่ปุ่น", hi: "जापानी", vi: "Nhật Bản" } },
  { id: "scandinavian", label: { en: "Scandinavian", th: "สแกนดินาเวีย", hi: "स्कैंडिनेवियाई", vi: "Scandinavia" } },
  { id: "tropical-minimal", label: { en: "Tropical Minimal", th: "โทรปิคัล มินิมอล", hi: "उष्णकटिबंधीय मिनिमल", vi: "Nhiệt đới tối giản" } },
] as const;

export const PRICING = {
  store: { pdf: 1000, cad: 1000 },
  custom: {
    pdf: { "1": 1990, "2": 2990 },
    cad: 4990,
  },
} as const;
