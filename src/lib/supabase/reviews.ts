import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export interface PlanReview {
  id: string;
  listingId: string;
  authorKey: string;
  authorName: string;
  rating: number;
  title?: string;
  body?: string;
  photos: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface RatingAggregate {
  average: number;
  count: number;
}

interface ReviewRow {
  id: string;
  listing_id: string;
  author_key: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  photos: string[] | null;
  is_verified_purchase: boolean;
  is_published: boolean;
  created_at: string;
}

function rowToReview(row: ReviewRow): PlanReview {
  return {
    id: row.id,
    listingId: row.listing_id,
    authorKey: row.author_key,
    authorName: row.author_name,
    rating: row.rating,
    title: row.title ?? undefined,
    body: row.body ?? undefined,
    photos: row.photos ?? [],
    isVerifiedPurchase: row.is_verified_purchase,
    createdAt: row.created_at,
  };
}

export async function getReviewsForListing(listingId: string): Promise<PlanReview[]> {
  if (!isSupabaseConfigured() || !listingId) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("plan_reviews")
    .select("*")
    .eq("listing_id", listingId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as ReviewRow[]).map(rowToReview);
}

export function aggregateRating(reviews: PlanReview[]): RatingAggregate | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

/** Aggregate rating for a listing (schema/rich-snippet friendly). */
export async function getRatingAggregate(listingId: string): Promise<RatingAggregate | null> {
  const reviews = await getReviewsForListing(listingId);
  return aggregateRating(reviews);
}

export interface AddReviewInput {
  listingId: string;
  authorKey: string;
  authorName: string;
  rating: number;
  title?: string;
  body?: string;
  photos?: string[];
  isVerifiedPurchase?: boolean;
}

export async function addReview(input: AddReviewInput): Promise<PlanReview> {
  const { data, error } = await getSupabaseAdmin()
    .from("plan_reviews")
    .upsert(
      {
        listing_id: input.listingId,
        author_key: input.authorKey,
        author_name: input.authorName,
        rating: Math.min(5, Math.max(1, Math.round(input.rating))),
        title: input.title ?? null,
        body: input.body ?? null,
        photos: input.photos ?? [],
        is_verified_purchase: input.isVerifiedPurchase ?? false,
      },
      { onConflict: "listing_id,author_key" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return rowToReview(data as ReviewRow);
}
