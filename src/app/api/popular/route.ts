import { NextRequest, NextResponse } from "next/server";
import { getPopularListings } from "@/lib/ranking/popular";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const limitParam = Number(request.nextUrl.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 50) : undefined;
  try {
    const listings = await getPopularListings(limit);
    return NextResponse.json({ listings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load popular";
    return NextResponse.json({ error: message, listings: [] }, { status: 500 });
  }
}
