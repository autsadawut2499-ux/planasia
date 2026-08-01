import { NextRequest, NextResponse } from "next/server";
import { requireVendorSession } from "@/lib/vendor/auth";
import {
  reviewVendorKyc,
  submitVendorKyc,
  submitVendorVerification,
  type KycDocType,
  type KycInfo,
} from "@/lib/supabase/vendors";
import { verifyVendorKycDigital } from "@/lib/marketplace/kyc-verify";

export const dynamic = "force-dynamic";

/** KYC is Thailand-only (Thai draftsmen / architectural designers). */
const THAI_COUNTRY_CODE = "TH";

const DOC_TYPES: KycDocType[] = [
  "national_id",
  "passport",
  "driver_license",
  "professional_license",
];

export async function POST(request: NextRequest) {
  const auth = await requireVendorSession(request);
  if (!auth.ok) return auth.response;
  const ownerKey = auth.ownerKey;

  try {
    const body = await request.json();
    const documents: string[] = Array.isArray(body.documents)
      ? body.documents.map((d: unknown) => String(d)).filter(Boolean).slice(0, 10)
      : [];
    if (documents.length === 0) {
      return NextResponse.json(
        { error: "กรุณาอัปโหลดรูปเอกสารยืนยันตัวตนอย่างน้อย 1 รูป" },
        { status: 400 },
      );
    }
    // KYC stores photos only — reject PDF blueprint URLs that slipped through.
    const nonImage = documents.filter((url: string) => {
      try {
        const path = new URL(url).pathname.toLowerCase();
        return path.endsWith(".pdf");
      } catch {
        return true;
      }
    });
    if (nonImage.length > 0) {
      return NextResponse.json(
        {
          error:
            "การยืนยันตัวตนรับเฉพาะไฟล์รูปภาพ (JPG, PNG, WEBP, GIF) — ไม่รับไฟล์ PDF สำหรับหน้าเอกสาร / หลังเอกสาร / เซลฟี",
        },
        { status: 400 },
      );
    }
    const note = body.note ? String(body.note).trim() : undefined;

    // Full KYC submission (structured identity) when a `kyc` object is provided.
    if (body.kyc && typeof body.kyc === "object") {
      const raw = body.kyc as Record<string, unknown>;
      const legalName = String(raw.legalName ?? "").trim();
      const docType = String(raw.docType ?? "") as KycDocType;
      const docNumber = String(raw.docNumber ?? "").trim();
      // Force Thailand — platform serves Thai draftsmen only.
      const countryCode = THAI_COUNTRY_CODE;

      if (!legalName) {
        return NextResponse.json({ error: "กรุณากรอกชื่อ-นามสกุลตามเอกสาร" }, { status: 400 });
      }
      if (!DOC_TYPES.includes(docType)) {
        return NextResponse.json({ error: "ประเภทเอกสารไม่ถูกต้อง" }, { status: 400 });
      }
      if (!docNumber) {
        return NextResponse.json(
          { error: "กรุณากรอกเลขประจำตัวประชาชน หรือเลขเอกสารที่ใช้ยืนยัน" },
          { status: 400 },
        );
      }
      if (String(raw.countryCode ?? THAI_COUNTRY_CODE).trim().toUpperCase() !== THAI_COUNTRY_CODE) {
        return NextResponse.json(
          { error: "แพลตฟอร์มนี้รองรับการยืนยันตัวตนเฉพาะผู้ใช้งานในประเทศไทยเท่านั้น" },
          { status: 400 },
        );
      }

      const kyc: KycInfo = {
        legalName,
        docType,
        docNumber,
        countryCode,
        dateOfBirth: raw.dateOfBirth ? String(raw.dateOfBirth) : undefined,
        address: raw.address ? String(raw.address).trim() : undefined,
      };

      // Persist package, then digital AI auto-verify instantly (no admin queue).
      await submitVendorKyc(ownerKey, { kyc, documents, note });
      const decision = await verifyVendorKycDigital(kyc, documents);
      await reviewVendorKyc(
        ownerKey,
        decision.approved ? "approved" : "rejected",
        `ai-system:${decision.provider}`,
        decision.approved ? undefined : decision.reasons.join("; "),
      );

      // Listings appear on upload as pending; purchase unlock is admin Approve.
      // KYC only verifies the seller identity — it does not auto-approve sales.

      return NextResponse.json({
        verificationStatus: decision.approved ? "approved" : "rejected",
        verification: { documents, note: note ?? null },
        kyc,
        submittedAt: new Date().toISOString(),
        aiDecision: decision,
        autoVerified: true,
        publishedCount: 0,
      });
    }

    // Legacy: documents-only — still digital-auto via rules (require ≥2 docs).
    await submitVendorVerification(ownerKey, documents, note);
    const legacyKyc: KycInfo = {
      legalName: "ผู้ส่งแบบเดิม",
      docType: "national_id",
      docNumber: "LEGACY00000",
      countryCode: THAI_COUNTRY_CODE,
    };
    const decision = await verifyVendorKycDigital(legacyKyc, documents);
    await reviewVendorKyc(
      ownerKey,
      "rejected",
      "ai-system:rules",
      "กรุณากรอกข้อมูลยืนยันตัวตนให้ครบ (ชื่อ ประเภทเอกสาร เลขเอกสาร) เพื่อให้ระบบตรวจอัตโนมัติได้",
    );

    return NextResponse.json({
      verificationStatus: "rejected",
      verification: { documents, note: note ?? null },
      submittedAt: new Date().toISOString(),
      aiDecision: decision,
      autoVerified: true,
      message: "กรุณาส่งข้อมูลยืนยันตัวตนให้ครบทุกช่องเพื่อให้ระบบตรวจอัตโนมัติ",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "ส่งข้อมูลยืนยันตัวตนไม่สำเร็จ";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
