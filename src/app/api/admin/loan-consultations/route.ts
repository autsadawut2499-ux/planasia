import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { normalizeLoanConsultationSettings } from "@/lib/loan-consultation/settings";
import {
  loadLoanConsultationSettings,
  saveLoanConsultationSettings,
} from "@/lib/supabase/loan-consultation-settings";
import {
  listLoanConsultations,
  updateLoanConsultationStatus,
} from "@/lib/supabase/loan-consultations";
import type { LoanConsultation } from "@/lib/loan-consultation/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    const [items, settings] = await Promise.all([
      listLoanConsultations(),
      loadLoanConsultationSettings(),
    ]);
    return NextResponse.json({
      items,
      settings: {
        expertLineOaUrl: settings.expertLineOaUrl,
        expertLineUserId: settings.expertLineUserId,
        /** Never echo full token — only whether one is stored. */
        hasLineChannelAccessToken: Boolean(settings.lineChannelAccessToken),
        hasEnvLineToken: Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim()),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = (await request.json()) as Record<string, unknown>;
    const id = String(body.id ?? "").trim();
    const status = String(body.status ?? "").trim() as LoanConsultation["status"];
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    if (status !== "new" && status !== "contacted" && status !== "closed") {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    const item = await updateLoanConsultationStatus(id, status);
    return NextResponse.json({ item });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = (await request.json()) as Record<string, unknown>;
    const current = await loadLoanConsultationSettings();
    const incoming = normalizeLoanConsultationSettings(body.settings ?? body);

    // Keep existing token when the form sends an empty placeholder.
    const token =
      incoming.lineChannelAccessToken.trim() || current.lineChannelAccessToken;

    const saved = await saveLoanConsultationSettings(
      {
        expertLineOaUrl: incoming.expertLineOaUrl,
        expertLineUserId: incoming.expertLineUserId,
        lineChannelAccessToken: token,
      },
      admin.email,
    );

    return NextResponse.json({
      settings: {
        expertLineOaUrl: saved.expertLineOaUrl,
        expertLineUserId: saved.expertLineUserId,
        hasLineChannelAccessToken: Boolean(saved.lineChannelAccessToken),
        hasEnvLineToken: Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim()),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
