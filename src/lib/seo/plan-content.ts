import { getPlanPreset, type PlanFilterSpec } from "@/lib/seo/programmatic";
import { parsePlanSlug, styleLabelTh, type MatrixVariables } from "@/lib/seo/plan-matrix";

export interface PlanFaq {
  question: string;
  answer: string;
}

export interface PlanPageModel {
  slug: string;
  titleTh: string;
  h2: string;
  descriptionTh: string;
  longDescriptionTh: string;
  filter: PlanFilterSpec;
  faqs: PlanFaq[];
  isPreset: boolean;
}

/** Deterministic hash so each slug gets stable-but-varied copy (anti-duplicate). */
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(options: T[], seed: number, salt = 0): T {
  return options[(seed + salt) % options.length];
}

function describeVariables(v: MatrixVariables): string {
  const parts: string[] = [];
  if (v.floors === 1) parts.push("ชั้นเดียว");
  else if (v.floors === 2) parts.push("สองชั้น");
  else if (v.floors) parts.push(`${v.floors} ชั้น`);
  const style = styleLabelTh(v.style);
  if (style) parts.push(`สไตล์${style}`);
  if (v.widthMeters) parts.push(`หน้ากว้าง ${v.widthMeters} เมตร`);
  if (v.beds) parts.push(`${v.beds} ห้องนอน`);
  if (v.baths) parts.push(`${v.baths} ห้องน้ำ`);
  if (v.budgetLabel) parts.push(v.budgetLabel);
  return parts.join(" · ");
}

function buildTitle(v: MatrixVariables): string {
  const style = styleLabelTh(v.style);
  const floors = v.floors === 1 ? "ชั้นเดียว" : v.floors === 2 ? "สองชั้น" : v.floors ? `${v.floors} ชั้น` : "";
  const bits = ["แบบบ้าน", floors, style ? ` ${style}` : ""].join("");
  const extras: string[] = [];
  if (v.widthMeters) extras.push(`หน้ากว้าง ${v.widthMeters} ม.`);
  if (v.beds) extras.push(`${v.beds} ห้องนอน`);
  if (v.budgetLabel) extras.push(v.budgetLabel);
  return extras.length ? `${bits} ${extras.join(" ")}`.trim() : bits.trim();
}

/** AI-style content spinning without external calls: varied phrasing per slug. */
function spinContent(slug: string, v: MatrixVariables) {
  const seed = hashSeed(slug);
  const spec = describeVariables(v);

  const intros = [
    `รวมแบบบ้าน${spec} คัดสรรคุณภาพ พร้อมไฟล์ PDF พิมพ์เขียวหน่วยเมตร`,
    `เลือกชมแบบบ้าน${spec} ที่ตอบโจทย์การอยู่อาศัยจริง ดาวน์โหลดไฟล์ PDF ได้ทันที`,
    `แบบบ้าน${spec} ดีไซน์ลงตัว ใช้งานได้จริง พร้อมแปลนพิมพ์เขียวไฟล์ PDF ครบชุด`,
    `ค้นหาแบบบ้าน${spec} ในสไตล์ที่ใช่ พร้อมไฟล์ PDF คุณภาพสูง หน่วยวัดระบบเมตร`,
  ];
  const closers = [
    "ทุกแบบประทับตราชื่อผู้ซื้อเพื่อความปลอดภัย และปลดล็อกดาวน์โหลดทันทีหลังชำระเงิน",
    "รองรับการปรับแบบเพิ่มเติมโดยสถาปนิกและนักออกแบบมืออาชีพ พร้อมส่งไฟล์ทันทีหลังซื้อ",
    "เหมาะใช้เป็นแนวทางออกแบบและประเมินราคา — ควรให้ผู้มีใบอนุญาตท้องถิ่นรับรองก่อนก่อสร้างจริง",
    "มาพร้อมภาพพรีวิวและรายละเอียดสเปกครบถ้วน เลือกซื้อและดาวน์โหลดได้ในไม่กี่คลิก",
  ];
  const h2s = [
    `แบบบ้าน${spec} ยอดนิยม`,
    `รวมแบบบ้าน${spec} ที่แนะนำ`,
    `แบบบ้าน${spec} ทั้งหมดในหมวดนี้`,
  ];

  return {
    description: pick(intros, seed),
    long: `${pick(intros, seed, 1)} ${pick(closers, seed, 2)}`,
    h2: pick(h2s, seed, 3),
  };
}

function buildFaqs(v: MatrixVariables, slug: string): PlanFaq[] {
  const spec = describeVariables(v) || "แบบบ้าน";
  const seed = hashSeed(slug);
  const priceLine = v.budgetLabel
    ? `แบบบ้านในหมวดนี้อยู่ใน${v.budgetLabel} โดยราคาไฟล์แบบเริ่มต้นแสดงในแต่ละรายการ`
    : "ราคาไฟล์แบบแปลน (PDF) แสดงชัดเจนในแต่ละรายการ และปลดล็อกดาวน์โหลดทันทีหลังชำระเงิน";

  const faqs: PlanFaq[] = [
    {
      question: `แบบบ้าน${spec} ราคาเท่าไหร่?`,
      answer: priceLine,
    },
    {
      question: "ซื้อแล้วได้ไฟล์อะไรบ้าง?",
      answer:
        "ได้ไฟล์ PDF แปลนพิมพ์เขียวคุณภาพสูง หน่วยวัดระบบเมตร ประทับตราชื่อผู้ซื้อ ดาวน์โหลดได้ทันทีหลังชำระเงินสำเร็จ",
    },
    {
      question: "สามารถปรับแก้แบบได้ไหม?",
      answer:
        "ได้ คุณสามารถติดต่อสถาปนิกและนักออกแบบผู้สร้างสรรค์ผลงานผ่านหน้าโปรไฟล์เพื่อขอปรับแบบเพิ่มเติมตามที่ดินและงบประมาณจริง",
    },
    {
      question: "ใช้ยื่นขออนุญาตก่อสร้างได้หรือไม่?",
      answer:
        "ไฟล์บนแพลตฟอร์มเป็นแนวทางออกแบบและประเมินราคา ไม่ใช่ชุดยื่นขออนุญาตอัตโนมัติ — กรุณาให้วิศวกร/สถาปนิกผู้มีใบอนุญาตรับรองตามข้อกำหนดท้องถิ่นก่อนก่อสร้าง",
    },
  ];
  // Light shuffle for anti-duplicate signal while keeping Q1 as the anchor.
  const tail = faqs.slice(1);
  const rotate = seed % tail.length;
  return [faqs[0], ...tail.slice(rotate), ...tail.slice(0, rotate)];
}

/**
 * Resolve a /plans/[slug] page from either a curated preset or the dynamic URL
 * matrix. Returns null for unrecognised slugs (→ 404, avoids thin pages).
 */
export function resolvePlanPage(slug: string): PlanPageModel | null {
  const preset = getPlanPreset(slug);
  if (preset) {
    // Derive variables from the preset filter for FAQ/spun content.
    const v: MatrixVariables = {
      style: preset.filter.style,
      floors: preset.filter.floors,
      widthMeters: preset.filter.widthMeters,
      budgetMax: preset.filter.budgetMax,
      budgetLabel: preset.filter.budgetMax
        ? `งบไม่เกิน ${(preset.filter.budgetMax / 1_000_000).toLocaleString("th-TH")} ล้าน`
        : undefined,
    };
    const spun = spinContent(slug, v);
    return {
      slug,
      titleTh: preset.titleTh,
      h2: spun.h2,
      descriptionTh: preset.descriptionTh,
      longDescriptionTh: spun.long,
      filter: preset.filter,
      faqs: buildFaqs(v, slug),
      isPreset: true,
    };
  }

  const parsed = parsePlanSlug(slug);
  if (!parsed) return null;

  const spun = spinContent(slug, parsed.variables);
  return {
    slug,
    titleTh: buildTitle(parsed.variables),
    h2: spun.h2,
    descriptionTh: spun.description,
    longDescriptionTh: spun.long,
    filter: parsed.filter,
    faqs: buildFaqs(parsed.variables, slug),
    isPreset: false,
  };
}
