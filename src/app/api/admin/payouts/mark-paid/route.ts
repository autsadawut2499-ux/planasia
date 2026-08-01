import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { markEarningsPaidOut } from "@/lib/supabase/vendor-earnings";

export const dynamic = "force-dynamic";

/**
 * POST { ownerKeys?: string[], earningIds?: string[], note?: string }
 * Marks matching available earnings as paid_out and writes a payout batch.
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = (await request.json()) as {
      ownerKeys?: unknown;
      earningIds?: unknown;
      note?: unknown;
    };

    const ownerKeys = Array.isArray(body.ownerKeys)
      ? body.ownerKeys.map((k) => String(k).trim()).filter(Boolean)
      : [];
    const earningIds = Array.isArray(body.earningIds)
      ? body.earningIds.map((k) => String(k).trim()).filter(Boolean)
      : [];
    const note = body.note != null ? String(body.note).trim() : undefined;

    const result = await markEarningsPaidOut({
      adminEmail: admin.email,
      ownerKeys,
      earningIds,
      note,
    });

    return NextResponse.json({
      ok: true,
      batch: result.batch,
      updatedCount: result.updatedCount,
      vendorTotalThb: result.vendorTotalThb,
      message: `บันทึกโอนแล้ว ${result.updatedCount} รายการ · ฿${result.vendorTotalThb.toLocaleString("th-TH")}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Mark paid failed";
    const status = message.includes("Unauthorized")
      ? 401
      : message.includes("ไม่พบ") || message.includes("ต้องระบุ")
        ? 400
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
