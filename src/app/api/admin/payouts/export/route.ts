import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  buildPayoutCsv,
  listVendorsDueForPayout,
} from "@/lib/supabase/vendor-earnings";

export const dynamic = "force-dynamic";

/** GET — CSV of vendors with available balance + bank details. */
export async function GET() {
  try {
    await requireAdminSession();
    const vendors = await listVendorsDueForPayout();
    const csv = buildPayoutCsv(vendors);
    const stamp = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="planasia-payouts-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    const status = message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
