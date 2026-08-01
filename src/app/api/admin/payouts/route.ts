import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  listPayoutBatches,
  listVendorsDueForPayout,
} from "@/lib/supabase/vendor-earnings";

export const dynamic = "force-dynamic";

/** GET — vendors due for payout + recent payout batches. */
export async function GET() {
  try {
    await requireAdminSession();
    const [vendors, batches] = await Promise.all([
      listVendorsDueForPayout(),
      listPayoutBatches(40),
    ]);
    const due = vendors.filter((v) => v.availableThb > 0);
    const availableTotalThb = due.reduce((s, v) => s + v.availableThb, 0);
    return NextResponse.json({
      summary: {
        vendorsDue: due.length,
        availableTotalThb,
        missingBankDetails: due.filter((v) => !v.hasBankDetails).length,
      },
      vendors,
      batches,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    const status = message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
