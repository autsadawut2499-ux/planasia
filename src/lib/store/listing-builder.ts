import { HOUSE_STYLES, type Locale } from "@/lib/geo/countries";
import type { PlanOptions, ProjectInput } from "@/lib/ai/types";
import { pickLocalizedLabel } from "@/lib/i18n/localized-text";

const DEFAULT_LOCATION: Record<Locale, string> = {
  en: "Thailand",
  th: "ประเทศไทย",
  hi: "थाईलैंड",
  vi: "Thailand",
};

const AREA_UNIT: Record<Locale, string> = {
  en: "sqm",
  th: "ตร.ม.",
  hi: "वर्ग मी.",
  vi: "m²",
};

const EXTRAS: Record<
  keyof Pick<PlanOptions, "includeElectrical" | "includePlumbing" | "includeStructural">,
  Record<Locale, string>
> = {
  includeElectrical: { en: "electrical", th: "ไฟฟ้า", hi: "विद्युत", vi: "điện" },
  includePlumbing: { en: "plumbing", th: "ประปา", hi: "प्लंबिंग", vi: "cấp thoát nước" },
  includeStructural: { en: "structural", th: "โครงสร้าง", hi: "संरचना", vi: "kết cấu" },
};

function styleLabel(styleId: string, locale: Locale): string {
  const s = HOUSE_STYLES.find((h) => h.id === styleId);
  return s ? pickLocalizedLabel(locale, s.label) : styleId;
}

function floorWord(floors: 1 | 2, locale: Locale): string {
  if (locale === "th") return `${floors} ชั้น`;
  if (locale === "hi") return floors === 1 ? "1 मंजिल" : "2 मंजिल";
  if (locale === "vi") return floors === 1 ? "1 tầng" : "2 tầng";
  return floors === 1 ? "1-storey" : "2-storey";
}

export function estimateBuiltArea(project: ProjectInput, locale: Locale = "en"): string {
  const base = project.floors === 2 ? 180 : 120;
  const extra = (project.bedrooms - 2) * 12 + (project.bathrooms - 2) * 8;
  const sqm = Math.max(base + extra, 80);
  return locale === "en" ? `~${sqm} sqm` : `~${sqm} ${AREA_UNIT[locale]}`;
}

export function buildListingDescription(
  project: ProjectInput,
  planOptions?: PlanOptions,
  locale: Locale = "en",
): string {
  const style = styleLabel(project.style, locale);
  const loc = project.location || DEFAULT_LOCATION[locale];
  const extras: string[] = [];
  if (planOptions?.includeElectrical) extras.push(EXTRAS.includeElectrical[locale]);
  if (planOptions?.includePlumbing) extras.push(EXTRAS.includePlumbing[locale]);
  if (planOptions?.includeStructural) extras.push(EXTRAS.includeStructural[locale]);
  const extraText = extras.length ? ` · ${extras.join(", ")}` : "";

  switch (locale) {
    case "th":
      return `${style} ${project.floors} ชั้น · ${project.bedrooms} ห้องนอน · ${project.bathrooms} ห้องน้ำ · ${loc}${extraText} — แบบบ้านที่สร้างร่วมกับ AI พร้อมชุดเอกสารขออนุญาต`;
    case "hi":
      return `${style} ${floorWord(project.floors, locale)} · ${project.bedrooms} बेडरूम · ${project.bathrooms} स्नानघर · ${loc}${extraText} — AI के साथ सह-निर्मित परमिट-तैयार घर योजना`;
    case "vi":
      return `${style} · ${floorWord(project.floors, locale)} · ${project.bedrooms} phòng ngủ · ${project.bathrooms} phòng tắm · ${loc}${extraText} — Bản vẽ nhà đồng sáng tạo với AI, sẵn sàng nộp hồ sơ`;
    default:
      return `${style} ${floorWord(project.floors, locale)} · ${project.bedrooms} bed · ${project.bathrooms} bath · ${loc}${extraText} — AI co-created permit-ready house plan set`;
  }
}

export function buildListingName(project: ProjectInput, locale: Locale = "en"): string {
  if (project.projectName?.trim()) return project.projectName.trim();
  const style = styleLabel(project.style, locale);
  const loc = project.location || DEFAULT_LOCATION[locale];
  if (locale === "th") return `${style} ${project.floors} ชั้น — ${loc}`;
  if (locale === "hi") return `${style} ${project.floors}F — ${loc}`;
  if (locale === "vi") return `${style} ${project.floors} tầng — ${loc}`;
  return `${style} ${project.floors}F — ${loc}`;
}
