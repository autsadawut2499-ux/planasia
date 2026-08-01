import { NextRequest, NextResponse } from "next/server";
import {
  createHomeBuilderRegistration,
  listPublishedHomeBuilders,
} from "@/lib/supabase/home-builders";
import type { HomeBuilderRegistrationInput } from "@/lib/home-building/types";
import { MAX_PORTFOLIO_IMAGES } from "@/lib/home-building/types";

export const dynamic = "force-dynamic";

/** Public directory of approved contractors. */
export async function GET() {
  try {
    const builders = await listPublishedHomeBuilders();
    return NextResponse.json({ builders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load builders";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Contractor registration — stored as pending for review. */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<HomeBuilderRegistrationInput>;

    const companyName = String(body.companyName ?? "").trim();
    const contactPerson = String(body.contactPerson ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = String(body.email ?? "").trim();
    const lineId = String(body.lineId ?? "").trim();
    const serviceAreas = String(body.serviceAreas ?? "").trim();
    const yearsExperience = Number(body.yearsExperience ?? 0);
    const expertise = String(body.expertise ?? "").trim();
    const portfolioUrls = Array.isArray(body.portfolioUrls)
      ? body.portfolioUrls.map(String).filter(Boolean).slice(0, MAX_PORTFOLIO_IMAGES)
      : [];

    if (!companyName) {
      return NextResponse.json({ error: "กรุณากรอกชื่อบริษัท / ผู้รับเหมา" }, { status: 400 });
    }
    if (!contactPerson) {
      return NextResponse.json({ error: "กรุณากรอกชื่อผู้ติดต่อ" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "กรุณากรอกเบอร์โทร" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "กรุณากรอกอีเมลให้ถูกต้อง" }, { status: 400 });
    }
    if (!serviceAreas) {
      return NextResponse.json({ error: "กรุณาระบุพื้นที่ให้บริการ" }, { status: 400 });
    }
    if (!Number.isFinite(yearsExperience) || yearsExperience < 0) {
      return NextResponse.json({ error: "กรุณาระบุประสบการณ์เป็นจำนวนปี" }, { status: 400 });
    }
    if (!body.privacyAccepted) {
      return NextResponse.json({ error: "กรุณายอมรับนโยบายความเป็นส่วนตัว" }, { status: 400 });
    }
    if (!body.termsAccepted) {
      return NextResponse.json({ error: "กรุณายอมรับข้อกำหนดและเงื่อนไข" }, { status: 400 });
    }

    const saved = await createHomeBuilderRegistration({
      companyName,
      contactPerson,
      phone,
      email,
      lineId,
      serviceAreas,
      yearsExperience,
      expertise,
      logoUrl: body.logoUrl ? String(body.logoUrl) : null,
      portfolioUrls,
      companyCertificateUrl: body.companyCertificateUrl
        ? String(body.companyCertificateUrl)
        : null,
      verificationDocumentUrl: body.verificationDocumentUrl
        ? String(body.verificationDocumentUrl)
        : null,
      privacyAccepted: true,
      termsAccepted: true,
    });

    return NextResponse.json({
      builder: saved,
      message: "ส่งใบสมัครเรียบร้อยแล้ว ทีมงานจะตรวจสอบเอกสารก่อนเผยแพร่",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    const status = message.includes("not configured") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
