import { getCountryByCode, type Locale } from "@/lib/geo/countries";
import type { PlanOptions, ProjectInput } from "@/lib/ai/types";
import type { ViewerIdentity } from "@/lib/user/identity";
import { resolvePrimaryUserId, getClientIp } from "@/lib/user/identity";
import type { NextRequest } from "next/server";
import { addListing, getAllListingsForSitemap, getListingByPlanId, type StoreListing } from "@/lib/store/db";
import { buildListingDescription, buildListingName, estimateBuiltArea } from "@/lib/store/listing-builder";
import { buildListingSlug, ensureUniqueSlug } from "@/lib/seo/slug";
import { computeStorePrice } from "@/lib/store/pricing";

export interface PublishListingInput {
  planId: string;
  project: ProjectInput;
  planOptions?: PlanOptions;
  image: string;
  floorPlanUrls?: string[];
  workspaceSessionId?: string;
  countryCode?: string;
  locale?: Locale;
  request?: NextRequest;
  viewer?: ViewerIdentity;
}

export async function publishListingToStore(input: PublishListingInput): Promise<StoreListing> {
  const existing = await getListingByPlanId(input.planId);
  if (existing) return existing;

  const country = getCountryByCode(input.countryCode ?? "TH");
  const pricing = computeStorePrice(input.project, input.planOptions, country.currency);

  let creatorBrowserId = input.viewer?.browserId ?? "";
  let creatorSessionUserId = input.viewer?.sessionUserId;
  let creatorIp = input.viewer?.ipAddress;
  const ownerId = resolvePrimaryUserId(creatorSessionUserId, creatorBrowserId);

  if (input.request) {
    const fromReq = input.request.headers;
    creatorBrowserId = creatorBrowserId || fromReq.get("x-browser-id") || "";
    creatorSessionUserId = creatorSessionUserId || fromReq.get("x-session-user-id") || undefined;
    creatorIp = creatorIp || getClientIp(input.request);
  }

  const primaryOwner = resolvePrimaryUserId(creatorSessionUserId, creatorBrowserId) || ownerId;
  if (!primaryOwner) {
    throw new Error("Owner identity required to publish listing");
  }

  const publishLocale: Locale = input.locale ?? country.defaultLocale;

  const draft = {
    id: input.planId,
    planId: input.planId,
    ownerId: primaryOwner,
    creatorBrowserId: creatorBrowserId || primaryOwner,
    creatorSessionUserId,
    creatorIp,
    creatorWorkspaceSessionId: input.workspaceSessionId,
    name: buildListingName(input.project, publishLocale),
    description: buildListingDescription(input.project, input.planOptions, publishLocale),
    beds: input.project.bedrooms,
    baths: input.project.bathrooms,
    floors: input.project.floors,
    area: estimateBuiltArea(input.project, publishLocale),
    style: input.project.style,
    image: input.image,
    floorPlanUrls: input.floorPlanUrls ?? [],
    price: pricing.total,
    priceBreakdown: pricing,
    projectSnapshot: input.project,
    source: "community-ai" as const,
    createdAt: new Date().toISOString(),
    slug: "",
  };

  const existingSlugs = new Set(
    (await getAllListingsForSitemap())
      .filter((l) => l.planId !== input.planId)
      .map((l) => l.slug),
  );
  const baseSlug = buildListingSlug(draft);
  const slug = ensureUniqueSlug(baseSlug, existingSlugs, input.planId);

  const listing: StoreListing = { ...draft, slug };

  return addListing(listing);
}
