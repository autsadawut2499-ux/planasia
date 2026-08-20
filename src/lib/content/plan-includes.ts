/** CMS content for “แบบประกอบด้วยอะไรบ้าง” / What the Plan Includes. */

export const PLAN_INCLUDES_MAX_IMAGES = 20;
export const PLAN_INCLUDES_SETTINGS_KEY = "plan_includes";

export interface PlanIncludesContent {
  title: { en: string; th: string };
  intro: { en: string; th: string };
  /** Article body — HTML from TipTap (legacy plain text still supported). */
  body: { en: string; th: string };
  /** Preview images: floor plans, elevations, BOQ, engineering (max 20). */
  images: string[];
}

/** High-quality Unsplash defaults so the gallery looks complete before admin uploads. */
export const DEFAULT_PLAN_INCLUDES_IMAGES: string[] = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
];

export const DEFAULT_PLAN_INCLUDES: PlanIncludesContent = {
  title: {
    en: "What the Plan Includes",
    th: "แบบประกอบด้วยอะไรบ้าง",
  },
  intro: {
    en: "Every ready-to-build house plan on Planasia ships as a complete main package — printed sets, bank BOQ, and cost estimate. Optional site-plan drafting is available as an add-on.",
    th: "แบบบ้านพร้อมสร้างทุกหลังบน Planasia ส่งเป็นแพ็กเกจหลักครบ — เอกสารรูปเล่ม, ใบ BOQ ยื่นกู้ธนาคาร และใบประมาณราคา มีบริการเขียนแผนผังบริเวณเป็นตัวเลือกเสริม",
  },
  body: {
    en: `Main package includes
Full printed document set × 3 (A3), BOQ for bank loan applications, and a cost estimate sheet.

Full printed document set × 3 (A3)
Complete hard-copy drawing sets in A3 size — three copies for permit, site, and your records.

BOQ for bank loan applications
Bill of quantities prepared for bank loan / mortgage submission.

Cost estimate sheet
A preliminary cost estimate to help you plan construction budgeting with your builder.

Optional add-on
Site plan drafting (เขียนแผนผังบริเวณ) can be added at checkout when you need a site layout for permit submission.

How to use this page
The gallery below shows the kinds of sheets and visuals you can expect. Exact contents vary by listing — always check the product page for that specific plan before purchase.`,
    th: `แพ็กเกจหลักรวม
เอกสารรูปเล่ม ฉบับเต็ม 3 ชุด ขนาด A3, ใบ BOQ สำหรับยื่นกู้ธนาคาร, และใบประมาณราคา

เอกสารรูปเล่ม ฉบับเต็ม 3 ชุด ขนาด A3
ชุดแบบรูปเล่มครบขนาด A3 จำนวน 3 ชุด สำหรับยื่นอนุญาต หน้างาน และเก็บไว้เป็นสำเนา

ใบ BOQ สำหรับยื่นกู้ธนาคาร
ใบรายการปริมาณวัสดุสำหรับใช้ยื่นกู้หรือสินเชื่อกับธนาคาร

ใบประมาณราคา
ใบประมาณราคาเบื้องต้นช่วยวางแผนงบก่อสร้างร่วมกับผู้รับเหมา

ตัวเลือกเสริม
บริการเขียนแผนผังบริเวณ เพิ่มได้ตอนชำระเงิน เมื่อต้องการผังบริเวณสำหรับยื่นขออนุญาต

วิธีใช้หน้านี้
แกลเลอรีด้านล่างแสดงลักษณะแผ่นงานและภาพที่คุณอาจได้รับ รายละเอียดจริงขึ้นกับแต่ละแบบ — โปรดดูหน้าสินค้าของแบบนั้นๆ ก่อนสั่งซื้อ`,
  },
  images: DEFAULT_PLAN_INCLUDES_IMAGES,
};

export function normalizePlanIncludes(
  raw: Partial<PlanIncludesContent> | null | undefined,
): PlanIncludesContent {
  const images = Array.isArray(raw?.images)
    ? raw!.images.map((u) => String(u).trim()).filter(Boolean).slice(0, PLAN_INCLUDES_MAX_IMAGES)
    : [];

  return {
    title: {
      en: raw?.title?.en?.trim() || DEFAULT_PLAN_INCLUDES.title.en,
      th: raw?.title?.th?.trim() || DEFAULT_PLAN_INCLUDES.title.th,
    },
    intro: {
      en: raw?.intro?.en?.trim() || DEFAULT_PLAN_INCLUDES.intro.en,
      th: raw?.intro?.th?.trim() || DEFAULT_PLAN_INCLUDES.intro.th,
    },
    body: {
      en: raw?.body?.en?.trim() || DEFAULT_PLAN_INCLUDES.body.en,
      th: raw?.body?.th?.trim() || DEFAULT_PLAN_INCLUDES.body.th,
    },
    // Keep empty arrays so admin can clear; public page falls back to defaults when empty
    images,
  };
}

/** Split body into paragraphs; single-line headings (no trailing period, short) become h3. */
export function planIncludesBlocks(
  body: string,
): Array<{ type: "heading" | "paragraph"; text: string }> {
  const parts = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return parts.map((text) => {
    const isHeading =
      text.length < 80 &&
      !text.includes(". ") &&
      !text.endsWith(".") &&
      !text.endsWith("。") &&
      text.split("\n").length === 1;
    return { type: isHeading ? "heading" : "paragraph", text };
  });
}
