import { NextRequest, NextResponse } from "next/server";
import { requireVendorSession } from "@/lib/vendor/auth";
import { upsertVendorPayout } from "@/lib/supabase/vendors";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  const auth = await requireVendorSession(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const priv = await upsertVendorPayout(auth.ownerKey, {
      bankName: body.bankName ? String(body.bankName).trim() : undefined,
      accountName: body.accountName ? String(body.accountName).trim() : undefined,
      accountNumber: body.accountNumber ? String(body.accountNumber).trim() : undefined,
    });
    return NextResponse.json({ payout: priv.payout });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save payout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
