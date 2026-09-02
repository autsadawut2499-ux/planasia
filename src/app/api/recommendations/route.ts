import { NextRequest, NextResponse } from "next/server";
import { getCountryByCode } from "@/lib/geo/countries";
import { getViewerFromRequest, resolvePrimaryUserId } from "@/lib/user/identity";
import { recommendListings } from "@/lib/recommend/engine";
import type { RecommendationFilters } from "@/lib/recommend/types";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function numberParam(params: URLSearchParams, key: string): number | undefined {
  const raw = params.get(key);
  if (raw == null || raw === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

export async function GET(request: NextRequest) {
  const viewer = getViewerFromRequest(request);
  const viewerKey = resolvePrimaryUserId(viewer.sessionUserId, viewer.browserId ?? viewer.primaryId);
  const params = request.nextUrl.searchParams;

  const filters: RecommendationFilters = {
    beds: numberParam(params, "beds"),
    baths: numberParam(params, "baths"),
    floors: numberParam(params, "floors"),
    areaMin: numberParam(params, "areaMin"),
    areaMax: numberParam(params, "areaMax"),
    widthMeters: numberParam(params, "widthMeters"),
    lengthMeters: numberParam(params, "lengthMeters"),
    budgetMin: numberParam(params, "budgetMin"),
    budgetMax: numberParam(params, "budgetMax"),
    // Legacy "collection" query param is folded into the unified style filter.
    style: params.get("style") || params.get("collection") || undefined,
  };

  const excludeIds = (params.get("exclude") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const limit = numberParam(params, "limit") ?? 8;

  try {
    const results = await recommendListings({
      viewerKey: viewerKey || undefined,
      filters,
      seedListingId: params.get("seed") || undefined,
      excludeIds,
      limit,
    });

    return NextResponse.json({
      recommendations: results,
      currency: getCountryByCode("TH").currency,
    });
  } catch (error) {
    console.error("[recommendations] failed", error);
    return NextResponse.json({ recommendations: [], error: "failed" }, { status: 500 });
  }
}
