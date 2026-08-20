import { NextRequest, NextResponse } from "next/server";
import { requireVendorSession } from "@/lib/vendor/auth";
import { createOrUpdateVendorListing } from "@/lib/vendor/create-listing";
import { PUBLIC_SELLER_SELF_LISTING_ENABLED } from "@/lib/features/public-seller";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!PUBLIC_SELLER_SELF_LISTING_ENABLED) {
    return NextResponse.json(
      {
        error: "Public seller listing is temporarily closed",
        message: "ขณะนี้ปิดการลงขายจากผู้เขียนแบบชั่วคราว — แบบบ้านลงโดยแอดมินเท่านั้น",
      },
      { status: 403 },
    );
  }

  const auth = await requireVendorSession(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createOrUpdateVendorListing(auth.ownerKey, body);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error, message: result.message ?? result.error },
        { status: result.status },
      );
    }

    return NextResponse.json({
      listing: result.listing,
      is_approved: result.is_approved,
      isApproved: result.is_approved,
      aiScreening: result.aiScreening,
      published: result.published,
      awaitingAdminApproval: result.awaitingAdminApproval,
      awaitingKyc: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save listing";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
