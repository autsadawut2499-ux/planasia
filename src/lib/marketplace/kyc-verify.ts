/**
 * Digital KYC auto-verification for Thai draftsmen / architectural designers.
 *
 * Thailand-only platform: structured identity + photo URLs are checked by
 * rules (+ optional Gemini). Pass → approved instantly. Fail → rejected with Thai reason.
 */

import { getTextModel, isGeminiConfigured } from "@/lib/ai/gemini";
import type { KycDocType, KycInfo } from "@/lib/supabase/vendors";

export interface KycAiDecision {
  approved: boolean;
  provider: "gemini" | "rules";
  checkedAt: string;
  reasons: string[];
  score: number;
}

const THAI_COUNTRY_CODE = "TH";

const DOC_TYPES: KycDocType[] = [
  "national_id",
  "passport",
  "driver_license",
  "professional_license",
];

function isHttpUrl(value: string): boolean {
  try {
    if (value.startsWith("planasia-private://")) {
      return value.includes("/kyc/") || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(value);
    }
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** KYC identity uploads must be image URLs (not PDF blueprint files). */
function looksLikeImageUrl(value: string): boolean {
  try {
    if (value.startsWith("planasia-private://")) {
      const lower = value.toLowerCase();
      if (lower.endsWith(".pdf")) return false;
      return lower.includes("/kyc/") || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(lower);
    }
    const path = new URL(value).pathname.toLowerCase();
    if (path.endsWith(".pdf")) return false;
    return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(path) || path.includes("/kyc/");
  } catch {
    return false;
  }
}

function ruleCheck(kyc: KycInfo, documents: string[]): { ok: boolean; reasons: string[]; score: number } {
  const reasons: string[] = [];

  if (!kyc.legalName || kyc.legalName.trim().length < 3) {
    reasons.push("ชื่อ-นามสกุลสั้นเกินไป");
  }
  if (!/[\p{L}]/u.test(kyc.legalName ?? "")) {
    reasons.push("ชื่อ-นามสกุลต้องมีตัวอักษร");
  }
  if (!DOC_TYPES.includes(kyc.docType)) {
    reasons.push("ประเภทเอกสารไม่ถูกต้อง");
  }
  if (!kyc.docNumber || kyc.docNumber.replace(/\s/g, "").length < 5) {
    reasons.push("เลขเอกสารสั้นเกินไป");
  }
  if (kyc.docType === "national_id") {
    const digits = kyc.docNumber.replace(/\D/g, "");
    if (digits.length !== 13) {
      reasons.push("เลขประจำตัวประชาชนต้องมี 13 หลัก");
    }
  }
  if ((kyc.countryCode || "").toUpperCase() !== THAI_COUNTRY_CODE) {
    reasons.push("รองรับการยืนยันตัวตนเฉพาะประเทศไทยเท่านั้น");
  }
  if (documents.length < 2) {
    reasons.push("ต้องมีรูปหน้าเอกสารและรูปเซลฟีถือเอกสารอย่างน้อย 2 รูป");
  }
  for (const doc of documents) {
    if (!isHttpUrl(doc)) {
      reasons.push("ลิงก์รูปเอกสารไม่ถูกต้อง");
      continue;
    }
    if (!looksLikeImageUrl(doc)) {
      reasons.push("ต้องอัปโหลดเป็นไฟล์รูปภาพ (JPG/PNG/WEBP/GIF) เท่านั้น ไม่รับ PDF");
    }
  }

  if (kyc.dateOfBirth) {
    const dob = new Date(kyc.dateOfBirth);
    if (Number.isNaN(dob.getTime())) reasons.push("วันเกิดไม่ถูกต้อง");
    else {
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (age < 18) reasons.push("ต้องมีอายุ 18 ปีขึ้นไป");
      if (age > 100) reasons.push("วันเกิดไม่น่าเป็นไปได้");
    }
  }

  const ok = reasons.length === 0;
  return { ok, reasons, score: ok ? 0.8 : 0.2 };
}

async function aiKycCheck(
  kyc: KycInfo,
  documents: string[],
): Promise<{ ok: boolean; reasons: string[]; score: number; provider: "gemini" | "rules" }> {
  const rules = ruleCheck(kyc, documents);
  if (!rules.ok) {
    return { ...rules, provider: "rules" };
  }

  if (!isGeminiConfigured()) {
    return {
      ok: true,
      reasons: ["ผ่านการตรวจสอบเบื้องต้น (ระบบ AI ออฟไลน์)"],
      score: rules.score,
      provider: "rules",
    };
  }

  const model = getTextModel();
  if (!model) {
    return {
      ok: true,
      reasons: ["ผ่านการตรวจสอบเบื้องต้น"],
      score: rules.score,
      provider: "rules",
    };
  }

  const prompt = `คุณเป็นระบบยืนยันตัวตนอัตโนมัติสำหรับตลาดแบบบ้านในประเทศไทย
แพลตฟอร์มนี้รับเฉพาะนักเขียนแบบ / นักออกแบบสถาปัตย์ในประเทศไทยเท่านั้น

ตอบกลับเป็น JSON เท่านั้น (reasons ต้องเป็นภาษาไทย):
{
  "ok": boolean,
  "score": number,
  "reasons": string[]
}

ปฏิเสธหากข้อมูลดูปลอม ไม่ครบ หรือไม่ใช่เอกสารของคนไทย / ไม่อยู่ในประเทศไทย

ข้อมูลที่ส่งมา:
${JSON.stringify(
  {
    legalName: kyc.legalName,
    docType: kyc.docType,
    docNumberMasked: `${kyc.docNumber.slice(0, 2)}***${kyc.docNumber.slice(-2)}`,
    countryCode: kyc.countryCode,
    dateOfBirth: kyc.dateOfBirth ?? null,
    hasAddress: Boolean(kyc.address),
    documentCount: documents.length,
  },
  null,
  2,
)}`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text()) as {
      ok?: boolean;
      score?: number;
      reasons?: unknown;
    };
    const reasons = Array.isArray(parsed.reasons)
      ? parsed.reasons.map((r) => String(r)).filter(Boolean).slice(0, 5)
      : [];
    const score = typeof parsed.score === "number" ? Math.min(1, Math.max(0, parsed.score)) : 0.7;
    const ok = Boolean(parsed.ok) && score >= 0.5;
    return {
      ok,
      score,
      reasons: reasons.length
        ? reasons
        : [ok ? "ผ่านการยืนยันตัวตนอัตโนมัติ" : "ไม่ผ่านการยืนยันตัวตนอัตโนมัติ"],
      provider: "gemini",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "ข้อผิดพลาดของระบบ AI";
    return {
      ok: true,
      score: rules.score,
      reasons: [`ระบบ AI ขัดข้องชั่วคราว แต่ผ่านการตรวจเบื้องต้นแล้ว (${msg.slice(0, 80)})`],
      provider: "rules",
    };
  }
}

/** Run digital KYC verification and return an instant approve/reject decision. */
export async function verifyVendorKycDigital(
  kyc: KycInfo,
  documents: string[],
): Promise<KycAiDecision> {
  const result = await aiKycCheck(kyc, documents);
  return {
    approved: result.ok,
    provider: result.provider,
    checkedAt: new Date().toISOString(),
    reasons: result.reasons,
    score: result.score,
  };
}
