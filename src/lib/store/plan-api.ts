import type { StoreListing } from "@/lib/store/listing-types";
import { isListingPurchasable, isListingPubliclyVisible } from "@/lib/store/listing-purchase";

/**
 * Test / integration contract: `is_approved` mirrors purchase unlock.
 * true for verified designers on create (moderation_status = approved).
 */
export function listingIsApproved(listing: Pick<StoreListing, "moderationStatus">): boolean {
  return isListingPurchasable(listing);
}

/** Attach camelCase + snake_case approval flags for API clients / tests. */
export function withApprovalFlags<T extends StoreListing>(listing: T) {
  const is_approved = listingIsApproved(listing);
  return {
    ...listing,
    is_approved,
    isApproved: is_approved,
    purchase_locked: !is_approved,
    purchaseLocked: !is_approved,
    visible: isListingPubliclyVisible(listing),
  };
}

export type PlanApiListing = ReturnType<typeof withApprovalFlags>;
