import type { Locale } from "@/lib/geo/countries";
import type { StoreListing } from "@/lib/store/db";
import {
  buildListingDescription,
  estimateBuiltArea,
} from "@/lib/store/listing-builder";
import { listingDisplayName } from "@/lib/store/plan-code";

/**
 * Store listing copy for the active locale.
 * House model names stay English ("MOD-001 Modern") site-wide.
 */
export function getLocalizedListing(
  listing: StoreListing,
  locale: Locale,
): Pick<StoreListing, "name" | "description" | "area"> {
  const name = listingDisplayName(listing);
  const project = listing.projectSnapshot;
  if (!project) {
    return {
      name,
      description: listing.description,
      area: listing.area,
    };
  }
  return {
    name,
    description: buildListingDescription(project, undefined, locale),
    area: estimateBuiltArea(project, locale),
  };
}
