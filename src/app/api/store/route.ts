import { NextRequest, NextResponse } from "next/server";
import { getCountryByCode } from "@/lib/geo/countries";
import { getListings } from "@/lib/store/db";
import { withApprovalFlags } from "@/lib/store/plan-api";
import { getViewerFromRequest } from "@/lib/user/identity";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

/** Public catalogue for the storefront grid. */
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
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    },
  );
}
