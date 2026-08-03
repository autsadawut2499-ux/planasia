import { NextRequest, NextResponse } from "next/server";
import { getCountryByCode } from "@/lib/geo/countries";
import { getListings } from "@/lib/store/db";
import { withApprovalFlags } from "@/lib/store/plan-api";
import { publishListingToStore } from "@/lib/store/publish";
import { revalidateStoreSurfaces } from "@/lib/store/revalidate-store";
import { getViewerFromRequest, resolvePrimaryUserId } from "@/lib/user/identity";
import type { PlanOptions, ProjectInput } from "@/lib/ai/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const viewer = getViewerFromRequest(request);
  const listings = (await getListings(viewer)).map(withApprovalFlags);
  const country = getCountryByCode("TH");

  return NextResponse.json(
    {
      listings,
      plans: listings,
      currency: country.currency,
    },
    {
      headers: {
        // Short private cache — cuts repeat catalogue chatter without serving stale admin approvals for long.
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  const viewer = getViewerFromRequest(request);
  const browserId = request.headers.get("x-browser-id");
  const sessionUserId = request.headers.get("x-session-user-id");
  const primaryId = resolvePrimaryUserId(sessionUserId, browserId ?? viewer.primaryId);

  if (!primaryId && !browserId) {
    return NextResponse.json({ error: "User identity required" }, { status: 401 });
  }

  const body = await request.json();
  const project = body.project as ProjectInput;
  const planOptions = body.planOptions as PlanOptions | undefined;
  const image = body.image as string;
  const planId = (body.planId as string) || (body.sessionId as string);
  const floorPlanUrls = (body.floorPlanUrls as string[]) ?? [];
  const workspaceSessionId = body.workspaceSessionId as string | undefined;
  const countryCode = (body.countryCode as string) ?? "TH";
  const locale = body.locale as import("@/lib/geo/countries").Locale | undefined;

  if (!planId || !project) {
    return NextResponse.json({ error: "planId and project required" }, { status: 400 });
  }

  const listing = await publishListingToStore({
    planId,
    project,
    planOptions,
    image,
    floorPlanUrls,
    workspaceSessionId,
    countryCode,
    locale,
    request,
    viewer: {
      ...viewer,
      browserId: browserId ?? viewer.browserId,
      sessionUserId: sessionUserId ?? viewer.sessionUserId,
      primaryId,
    },
  });

  revalidateStoreSurfaces({ slug: listing.slug, listingId: listing.id });

  return NextResponse.json({ listing, autoListed: true, planOptions });
}
