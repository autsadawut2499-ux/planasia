import type { StoreListing } from "@/lib/store/db";
import type { ViewerIdentity } from "@/lib/user/identity";

/**
 * Returns true when the viewer is the creator of this listing and it should be hidden
 * from their public Store view (privacy / IP-session-browser exclusion).
 */
export function isOwnListing(listing: StoreListing, viewer: ViewerIdentity): boolean {
  if (listing.source === "seed-demo") return false;

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
