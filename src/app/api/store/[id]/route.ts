import { NextRequest, NextResponse } from "next/server";
import { getListingById, getListingBySlug } from "@/lib/store/db";
import { isListingPubliclyVisible } from "@/lib/store/listing-purchase";
import { withApprovalFlags } from "@/lib/store/plan-api";
import { isOwnListing } from "@/lib/store/visibility";
import { getViewerFromRequest } from "@/lib/user/identity";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const viewer = getViewerFromRequest(request);
  const listing = (await getListingById(id)) ?? (await getListingBySlug(id));

  if (!listing || !isListingPubliclyVisible(listing)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only hide non-vendor "own" AI auto-listings from their creator.
  if (isOwnListing(listing, viewer)) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const plan = withApprovalFlags(listing);
  return NextResponse.json(
    { listing: plan, plan, is_approved: plan.is_approved },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    },
  );
}
