import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { PLATFORM_SHARE, VENDOR_SHARE } from "@/lib/commerce/commission";
import { listAllEarnings } from "@/lib/supabase/vendor-earnings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    const earnings = await listAllEarnings(200);
    const vendorTotal = earnings.reduce((s, e) => s + e.vendorAmountThb, 0);
    const platformTotal = earnings.reduce((s, e) => s + e.platformAmountThb, 0);
    return NextResponse.json({
      commission: { vendorShare: VENDOR_SHARE, platformShare: PLATFORM_SHARE },
      summary: {
        salesCount: earnings.length,
        vendorTotalThb: vendorTotal,
        platformTotalThb: platformTotal,
        grossThb: vendorTotal + platformTotal,
      },
      earnings,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
