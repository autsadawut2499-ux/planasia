import type { Locale } from "@/lib/geo/countries";
import type { StoreListing } from "@/lib/store/db";
import {
  buildListingDescription,
  buildListingName,
  estimateBuiltArea,
} from "@/lib/store/listing-builder";

/** Render store listing copy in the viewer's active locale. */
export function getLocalizedListing(
  listing: StoreListing,
  locale: Locale,
): Pick<StoreListing, "name" | "description" | "area"> {
  const project = listing.projectSnapshot;
  if (!project) {
    return { name: listing.name, description: listing.description, area: listing.area };
  }
  return {
    name: buildListingName(project, locale),
    description: buildListingDescription(project, undefined, locale),
    area: estimateBuiltArea(project, locale),
  };
}
