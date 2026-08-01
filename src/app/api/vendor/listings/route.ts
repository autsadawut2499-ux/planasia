import { NextRequest, NextResponse } from "next/server";
import { requireVendorSession } from "@/lib/vendor/auth";
import { createOrUpdateVendorListing } from "@/lib/vendor/create-listing";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
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
