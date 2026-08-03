import { getCountryByCode, type Locale } from "@/lib/geo/countries";
import type { PlanOptions, ProjectInput } from "@/lib/ai/types";
import type { ViewerIdentity } from "@/lib/user/identity";
import { resolvePrimaryUserId, getClientIp } from "@/lib/user/identity";
import type { NextRequest } from "next/server";
import {
  addListing,
  getAllListingsForSitemap,
  getListingByPlanDocumentId,
  getListingByPlanId,
  type StoreListing,
} from "@/lib/store/db";
import { buildListingDescription, estimateBuiltArea } from "@/lib/store/listing-builder";
import { allocatePlanCode, buildAutoListingName } from "@/lib/store/plan-code";
import { createRandomId } from "@/lib/random-id";
import { attachListingSeo } from "@/lib/seo/listing-seo-generate";
import { buildListingSlug, ensureUniqueSlug } from "@/lib/seo/slug";
import { computeStorePrice } from "@/lib/store/pricing";

export interface PublishListingInput {
  /** Workspace / house_plans document id. */
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
  const planDocumentId = input.planId;
  const existing =
    (await getListingByPlanDocumentId(planDocumentId)) ??
    (await getListingByPlanId(planDocumentId));
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
  const listingId = createRandomId();
  const planCode = await allocatePlanCode(input.project.style);

  const draft = {
    id: listingId,
    planCode,
    planDocumentId,
    planId: planCode,
    ownerId: primaryOwner,
    creatorBrowserId: creatorBrowserId || primaryOwner,
    creatorSessionUserId,
    creatorIp,
    creatorWorkspaceSessionId: input.workspaceSessionId,
    name: buildAutoListingName(input.project.style, planCode),
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
      .filter((l) => l.planDocumentId !== planDocumentId && l.id !== listingId)
      .map((l) => l.slug),
  );
  const baseSlug = buildListingSlug(draft);
  const slug = ensureUniqueSlug(baseSlug, existingSlugs, listingId);

  const listing = await attachListingSeo({ ...draft, slug });

  return addListing(listing);
}
