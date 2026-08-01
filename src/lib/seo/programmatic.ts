import { parseAreaSqm } from "@/lib/format";
import type { StoreListing } from "@/lib/store/listing-types";

/**
 * Programmatic SEO: keyword-targeted landing pages generated from the catalog.
 * Each preset maps a human search phrase (e.g. "แบบบ้านชั้นเดียว โมเดิร์น งบ 1 ล้าน")
 * to a set of structured filters, producing a crawlable /plans/[slug] page.
 */
export interface PlanFilterSpec {
  floors?: number;
  style?: string;
  budgetMax?: number;
  widthMeters?: number;
  beds?: number;
  baths?: number;
}

export interface PlanLandingPreset {
  slug: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  filter: PlanFilterSpec;
}

const STOREYS = [
  { key: "chan-diao", floors: 1, th: "ชั้นเดียว", en: "single-storey" },
  { key: "song-chan", floors: 2, th: "สองชั้น", en: "two-storey" },
];

const STYLES = [
  { key: "modern", th: "โมเดิร์น", en: "modern" },
  { key: "tropical", th: "ทรอปิคอล", en: "tropical" },
  { key: "minimal", th: "มินิมอล", en: "minimal" },
];

const BUDGETS = [
  { key: "ngop-1-lan", max: 1_000_000, th: "งบ 1 ล้าน", en: "budget 1M฿" },
  { key: "ngop-2-lan", max: 2_000_000, th: "งบ 2 ล้าน", en: "budget 2M฿" },
  { key: "ngop-3-lan", max: 3_000_000, th: "งบ 3 ล้าน", en: "budget 3M฿" },
];

const WIDTHS = [
  { key: "na-khaeb-6-metre", width: 6, th: "หน้าแคบ 6 เมตร", en: "6m narrow frontage" },
  { key: "na-khaeb-8-metre", width: 8, th: "หน้ากว้าง 8 เมตร", en: "8m frontage" },
  { key: "na-khaeb-10-metre", width: 10, th: "หน้ากว้าง 10 เมตร", en: "10m frontage" },
];

function buildPresets(): PlanLandingPreset[] {
  const presets: PlanLandingPreset[] = [];

  // storey × style × budget
  for (const storey of STOREYS) {
    for (const style of STYLES) {
      for (const budget of BUDGETS) {
        presets.push({
          slug: `baan-${storey.key}-${style.key}-${budget.key}`,
          titleTh: `แบบบ้าน${storey.th} ${style.th} ${budget.th}`,
          titleEn: `${style.en} ${storey.en} house plans (${budget.en})`,
          descriptionTh: `รวมแบบบ้าน${storey.th}สไตล์${style.th} ${budget.th} พร้อมไฟล์ PDF แปลนพิมพ์เขียว หน่วยเมตร ดาวน์โหลดได้ทันทีหลังชำระเงิน`,
          descriptionEn: `Curated ${style.en} ${storey.en} house plans (${budget.en}) with instant PDF blueprint download, metric units.`,
          filter: { floors: storey.floors, style: style.key, budgetMax: budget.max },
        });
      }
      // storey × style (no budget)
      presets.push({
        slug: `baan-${storey.key}-${style.key}`,
        titleTh: `แบบบ้าน${storey.th} ${style.th}`,
        titleEn: `${style.en} ${storey.en} house plans`,
        descriptionTh: `แบบบ้าน${storey.th}สไตล์${style.th}ทั้งหมด พร้อมไฟล์ PDF แปลนพิมพ์เขียว หน่วยเมตร`,
        descriptionEn: `All ${style.en} ${storey.en} house plans with PDF blueprints, metric units.`,
        filter: { floors: storey.floors, style: style.key },
      });
    }
    // storey + PDF phrase
    presets.push({
      slug: `plan-baan-${storey.key}-pdf`,
      titleTh: `แปลนบ้าน${storey.th} พร้อมไฟล์ PDF`,
      titleEn: `${storey.en} house floor plans with PDF`,
      descriptionTh: `แปลนบ้าน${storey.th}พร้อมไฟล์ PDF พิมพ์เขียวครบชุด ดาวน์โหลดทันที รองรับหน่วยเมตร`,
      descriptionEn: `${storey.en} floor plans delivered as ready-to-print PDF blueprints, metric units.`,
      filter: { floors: storey.floors },
    });
  }

  // width / frontage presets
  for (const w of WIDTHS) {
    presets.push({
      slug: `baan-${w.key}`,
      titleTh: `แบบบ้าน${w.th}`,
      titleEn: `House plans — ${w.en}`,
      descriptionTh: `แบบบ้าน${w.th} เหมาะกับที่ดิน${w.th} พร้อมไฟล์ PDF แปลนพิมพ์เขียว หน่วยเมตร`,
      descriptionEn: `House plans with ${w.en}, ideal for matching plots. PDF blueprints, metric units.`,
      filter: { widthMeters: w.width },
    });
  }

  return presets;
}

const PRESETS = buildPresets();
const PRESET_MAP = new Map(PRESETS.map((p) => [p.slug, p]));

export function getAllPlanPresets(): PlanLandingPreset[] {
  return PRESETS;
}

export function getPlanPreset(slug: string): PlanLandingPreset | undefined {
  return PRESET_MAP.get(slug);
}

/** Apply a preset's structured filter to the catalog. */
export function filterListingsBySpec(
  listings: StoreListing[],
  spec: PlanFilterSpec,
): StoreListing[] {
  return listings.filter((l) => {
    if (spec.floors && l.floors !== spec.floors) return false;
    if (spec.style && l.style?.toLowerCase() !== spec.style.toLowerCase()) return false;
    if (spec.budgetMax) {
      const cost = l.constructionCostEstimate ?? l.price;
      if (cost > spec.budgetMax) return false;
    }
    if (spec.widthMeters) {
      if (l.widthMeters == null) return false;
      if (Math.abs(l.widthMeters - spec.widthMeters) > 1) return false;
    }
    if (spec.beds && l.beds !== spec.beds) return false;
    if (spec.baths && l.baths !== spec.baths) return false;
    return true;
  });
}
