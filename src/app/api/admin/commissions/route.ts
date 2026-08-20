import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { listAllEarnings } from "@/lib/supabase/vendor-earnings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    const earnings = await listAllEarnings(200);
    const salesCount = earnings.length;
    const grossThb = earnings.reduce((s, e) => s + e.grossThb, 0);
    const costThb = earnings.reduce((s, e) => s + e.costThb, 0);
    const profitThb = earnings.reduce((s, e) => s + e.profitThb, 0);
    return NextResponse.json({
      summary: {
        salesCount,
        grossThb,
        costThb,
        profitThb,
      },
      earnings,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
