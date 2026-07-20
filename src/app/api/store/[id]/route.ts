import { NextRequest, NextResponse } from "next/server";
import { getListingById, getListingBySlug, getListings } from "@/lib/store/db";
import { getViewerFromRequest } from "@/lib/user/identity";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const viewer = getViewerFromRequest(request);
  const listing = (await getListingById(id)) ?? (await getListingBySlug(id));

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const visible = await getListings(viewer);
  if (!visible.some((l) => l.id === listing.id)) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  return NextResponse.json({ listing });
}
