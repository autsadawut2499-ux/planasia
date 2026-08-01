import { NextRequest, NextResponse } from "next/server";
import { getViewerFromRequest, resolvePrimaryUserId } from "@/lib/user/identity";
import { addReview, aggregateRating, getReviewsForListing } from "@/lib/supabase/reviews";
import { hasDownloadGrant } from "@/lib/supabase/download-grants";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const { id } = await context.params;
  try {
    const reviews = await getReviewsForListing(id);
    return NextResponse.json({ reviews, rating: aggregateRating(reviews) });
  } catch (error) {
    console.error("[reviews] GET failed", error);
    return NextResponse.json({ reviews: [], rating: null }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: Context) {
  const { id } = await context.params;
  const viewer = getViewerFromRequest(request);
  const viewerKey = resolvePrimaryUserId(viewer.sessionUserId, viewer.browserId ?? viewer.primaryId);
  if (!viewerKey) {
    return NextResponse.json({ error: "viewer identity required" }, { status: 401 });
  }

  let body: { rating?: number; authorName?: string; title?: string; body?: string; photos?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const rating = Number(body.rating);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "rating 1-5 required" }, { status: 400 });
  }
  const authorName = (body.authorName ?? "").trim() || "ผู้ซื้อ Planasia";

  try {
    // Verified-purchase badge when the buyer holds a download grant for this plan.
    const verified = await hasDownloadGrant(viewerKey, id).catch(() => false);
    const review = await addReview({
      listingId: id,
      authorKey: viewerKey,
      authorName,
      rating,
      title: body.title?.trim() || undefined,
      body: body.body?.trim() || undefined,
      photos: Array.isArray(body.photos) ? body.photos.slice(0, 6) : [],
      isVerifiedPurchase: verified,
    });
    const reviews = await getReviewsForListing(id);
    return NextResponse.json({ review, reviews, rating: aggregateRating(reviews) });
  } catch (error) {
    console.error("[reviews] POST failed", error);
    return NextResponse.json({ error: "failed to save review" }, { status: 500 });
  }
}
