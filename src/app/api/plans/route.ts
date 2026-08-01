import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/lib/store/db";
import { withApprovalFlags } from "@/lib/store/plan-api";
import { getViewerFromRequest } from "@/lib/user/identity";
import { requireVendorSession } from "@/lib/vendor/auth";
import { createOrUpdateVendorListing } from "@/lib/vendor/create-listing";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

/**
 * GET /api/plans — public catalogue for frontend instant display.
 * Each plan includes `is_approved` (false until admin Approve unlocks Buy).
 */
export async function GET(request: NextRequest) {
  const viewer = getViewerFromRequest(request);
  const listings = await getListings(viewer);
  const plans = listings.map(withApprovalFlags);

  return NextResponse.json(
    {
      plans,
      listings: plans,
      total: plans.length,
    },
    {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },
    },
  );
}

/**
 * POST /api/plans — designer/seller upload.
 * Writes to DB immediately; frontend can GET /api/plans right away.
 * New plans have is_approved=false (purchase locked) by default.
 */
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

    const plan = withApprovalFlags(result.listing);
    return NextResponse.json(
      {
        plan,
        listing: plan,
        is_approved: result.is_approved,
        isApproved: result.is_approved,
        purchase_locked: !result.is_approved,
        published: result.published,
        awaitingAdminApproval: result.awaitingAdminApproval,
        aiScreening: result.aiScreening,
        message: result.is_approved
          ? "Plan saved and purchasable"
          : "Plan visible on store; purchase locked until admin Approve",
      },
      { status: result.listing.id && body.id ? 200 : 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
