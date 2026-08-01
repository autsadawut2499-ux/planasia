import type { StoreListing } from "@/lib/store/db";
import type { ViewerIdentity } from "@/lib/user/identity";

/**
 * Returns true when the viewer is the creator of this listing and it should be
 * hidden from their public Store view.
 *
 * Marketplace vendor uploads stay visible to the uploader (Buy locked until
 * admin Approve) so sellers can confirm instant sync after upload.
 * Auto-listed community / workspace AI plans remain hidden from their creator.
 */
export function isOwnListing(listing: StoreListing, viewer: ViewerIdentity): boolean {
  if (listing.source === "seed-demo") return false;
  // Vendor catalogue listings must appear immediately for everyone, including the seller.
  if (listing.source === "vendor") return false;

  const { primaryId, browserId, sessionUserId, ipAddress } = viewer;
  if (!primaryId && !browserId && !sessionUserId && !ipAddress) return false;

  if (primaryId && listing.ownerId === primaryId) return true;
  if (browserId && listing.creatorBrowserId === browserId) return true;
  if (sessionUserId && listing.creatorSessionUserId === sessionUserId) return true;
  if (ipAddress && listing.creatorIp && listing.creatorIp === ipAddress) return true;

  return false;
}

export function filterListingsForViewer(
  listings: StoreListing[],
  viewer: ViewerIdentity,
): StoreListing[] {
  return listings.filter((item) => !isOwnListing(item, viewer));
}
