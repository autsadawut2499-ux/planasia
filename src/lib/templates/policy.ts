/**
 * Planasia template policy — authoritative clarification on กรมโยธาธิการ reference files.
 *
 * These PDFs in templates/master/ are INTERNAL REFERENCE ONLY.
 * They are NOT sold on the Store. Store listings are user+AI co-created designs.
 */

export const TEMPLATE_POLICY = {
  en: `IMPORTANT — Template Usage Policy:
The Department of Public Works (กรมโยธาธิการ) sample plans in our system are used ONLY as internal reference templates and drawing patterns for AI training and plan generation (line weights, title blocks, sheet layout, symbols).
Professional CAD (DWG) reference files from airport As-Built and civil/residential projects are likewise INTERNAL ONLY — used to learn proportions, layer structure, and discipline standards (A/S/SN/E).
We do NOT sell, redistribute, or list government template files or reference CAD files on the Store.
Store products are original house designs co-created by users and AI, informed by — but not copies of — these technical reference patterns.`,
  th: `นโยบายการใช้เทมเพลต — สำคัญ:
แบบแปลนตัวอย่างของกรมโยธาธิการและผังเมืองในระบบ ใช้เป็น "ตัวอย่างเทมเพลตและแพทเทิร์นในการเขียนแบบ" สำหรับ AI ศึกษาและอ้างอิงโครงสร้างทางเทคนิคเท่านั้น (เส้นสาย, Title Block, การจัดวางแผ่น, สัญลักษณ์)
ไฟล์ CAD (DWG) มาตรฐานจากงาน As-Built และแบบโยธา/แบบบ้าน ใช้เป็นแนวทางโครงสร้างเลเยอร์และสัดส่วนเท่านั้น ไม่ได้ขาย
เราไม่ได้ขาย แจกจ่าย หรือลงสโตร์ไฟล์แบบของกรมโยธาฯ หรือไฟล์ CAD อ้างอิง
สินค้าบนสโตร์คือแบบบ้านและดีไซน์ที่ผู้ใช้งานร่วมกับ AI สร้างขึ้นใหม่ โดยใช้แบบอ้างอิงเป็นเพียงแนวทางและตัวอย่างโครงสร้างทางเทคนิค`,
} as const;

export type StoreListingSource = "community-ai" | "seed-demo";

/** Store listings must always be user+AI designs — never government template files. */
export const STORE_LISTING_POLICY = {
  en: "All Store items are community designs created by users with AI. Government reference templates are never sold here.",
  th: "สินค้าทุกชิ้นในสโตร์คือแบบที่ผู้ใช้สร้างร่วมกับ AI ไม่มีการขายแบบของกรมโยธาธิการ",
} as const;
