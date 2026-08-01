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
    en: "Every ready-to-build house plan on Planasia is a complete drawing package — not just a pretty picture. Below is what you typically receive when you purchase a plan.",
    th: "แบบบ้านพร้อมสร้างทุกหลังบน Planasia คือชุดแบบครบ ไม่ใช่แค่รูปสวยๆ ด้านล่างคือสิ่งที่คุณมักได้รับเมื่อซื้อแบบบ้าน",
  },
  body: {
    en: `When you buy a digital house plan, you receive documents that help you understand the design and prepare for construction with your builder or engineer.

Architectural drawings
Floor plans for each level, exterior elevations, key sections, and door/window schedules so rooms, circulation, and overall proportions are clear.

3D concept & presentation views
Exterior and interior concept images that communicate massing, materials, and atmosphere — useful for client presentations and site discussions.

Structural & engineering references
Where included with the listing, structural layouts or notes that support coordination with a licensed engineer in your local jurisdiction.

BOQ / quantity samples
Some packages include sample bills of quantities or material summaries to help estimate construction budgets (always verify with your contractor).

How to use this page
The gallery below shows the kinds of sheets and visuals you can expect. Exact contents vary by listing — always check the product page for that specific plan before purchase.`,
    th: `เมื่อซื้อแบบบ้านดิจิทัล คุณจะได้รับเอกสารที่ช่วยให้เข้าใจดีไซน์ และเตรียมงานก่อสร้างร่วมกับผู้รับเหมาหรือวิศวกรได้

แบบสถาปัตยกรรม
แปลนพื้นแต่ละชั้น รูปด้านภายนอก รูปตัดสำคัญ และตารางประตู–หน้าต่าง เพื่อให้เห็นผังห้อง การไหลของพื้นที่ และสัดส่วนโดยรวมชัดเจน

ภาพคอนเซ็ปต์ 3D และการนำเสนอ
ภาพภายนอก–ภายในที่สื่อมวลสาร วัสดุ และบรรยากาศ เหมาะสำหรับนำเสนอลูกค้าและพูดคุยหน้างาน

ข้อมูลโครงสร้าง / วิศวกรรมอ้างอิง
ในบางแบบจะมีผังโครงสร้างหรือหมายเหตุประกอบ เพื่อประสานงานกับวิศวกรที่มีใบอนุญาตในท้องที่ของคุณ

ตัวอย่าง BOQ / ประมาณการวัสดุ
บางแพ็กเกจมีตัวอย่างรายการวัสดุหรือสรุปปริมาณ ช่วยประมาณงบก่อสร้างเบื้องต้น (ควรยืนยันกับผู้รับเหมาอีกครั้ง)

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

/** @deprecated use planIncludesBlocks */
export function planIncludesParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
