import type { StoreListing } from "@/lib/store/listing-types";

/**
 * Public catalogue visibility (store search / grid).
 * - Seller unpublished (`isPublished === false`) → hidden
 * - approved (or legacy null) → visible
 * - pending / rejected → hidden from public search
 */
export function isListingPubliclyVisible(
  listing: Pick<StoreListing, "moderationStatus" | "isPublished">,
): boolean {
  if (listing.isPublished === false) return false;
  const status = listing.moderationStatus;
  return status === "approved" || status == null;
}

/**
 * Purchase / checkout eligibility.
 * Buy buttons stay locked until admin sets moderation_status = approved.
 * Seller-unpublished listings are not purchasable.
 * Legacy null moderation rows are treated as approved (pre-moderation schema).
 */
export function isListingPurchasable(
  listing: Pick<StoreListing, "moderationStatus" | "isPublished">,
): boolean {
  if (listing.isPublished === false) return false;
  const status = listing.moderationStatus;
  return status === "approved" || status == null;
}
