/** Design direction options derived from Golden Standard catalog */

export const GOLDEN_STANDARD_PRESETS = [
  {
    id: "smart-a-type-e",
    label: { en: "Smart A TYPE E (Golden Standard)", th: "Smart A TYPE E (มาตรฐานทอง)" },
    description: {
      en: "Complete A/S/SN/E/ME/AC permit set",
      th: "ชุดเอกสารครบ A/S/SN/E/ME/AC",
    },
  },
  {
    id: "residential-mirror",
    label: { en: "Residential Mirror Set", th: "ชุดแบบบ้าน Mirror" },
    description: { en: "Plan + elevation + details", th: "แปลน + รูปด้าน + ขยาย" },
  },
  {
    id: "airport-asbuilt",
    label: { en: "Airport As-Built Reference", th: "อ้างอิง As-Built สนามบิน" },
    description: { en: "Large-scale discipline standards", th: "มาตรฐานงานโยธารายใหญ่" },
  },
] as const;

export const DISCIPLINE_PRESETS = [
  {
    id: "full",
    label: { en: "Full Permit Set", th: "ชุดเอกสารครบทุกหมวด" },
    includes: ["A", "S", "SN", "E", "ME", "AC"],
  },
  {
    id: "architectural",
    label: { en: "Architectural Only (A)", th: "สถาปัตยกรรม (A) เท่านั้น" },
    includes: ["A"],
  },
  {
    id: "arch-structure",
    label: { en: "Architecture + Structure (A+S)", th: "สถาปัตย์ + โครงสร้าง (A+S)" },
    includes: ["A", "S"],
  },
  {
    id: "arch-mep",
    label: { en: "Architecture + MEP (A+SN+E)", th: "สถาปัตย์ + ระบบ (A+SN+E)" },
    includes: ["A", "SN", "E"],
  },
] as const;

export const DECORATION_STYLES = [
  { value: "modern-minimal", label: { en: "Modern Minimal", th: "โมเดิร์นมินิมอล" } },
  { value: "tropical-luxury", label: { en: "Tropical Luxury", th: "โทรปิคัลหรู" } },
  { value: "thai-contemporary", label: { en: "Thai Contemporary", th: "ไทยร่วมสมัย" } },
  { value: "industrial-loft", label: { en: "Industrial Loft", th: "ลอฟท์อินดัสเทรียล" } },
  { value: "scandinavian", label: { en: "Scandinavian", th: "สแกนดินาเวียน" } },
  { value: "japanese-zen", label: { en: "Japanese Zen", th: "ญี่ปุ่นเซน" } },
] as const;

export type GoldenStandardPresetId = (typeof GOLDEN_STANDARD_PRESETS)[number]["id"];
export type DisciplinePresetId = (typeof DISCIPLINE_PRESETS)[number]["id"];
