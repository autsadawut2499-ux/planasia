import { NextRequest, NextResponse } from "next/server";
import { requireVendorSession, vendorSessionRequired } from "@/lib/vendor/auth";
import { claimVendorOwnershipFromBrowser } from "@/lib/vendor/claim-ownership";
import { getViewerFromRequest } from "@/lib/user/identity";
import { getVendorByOwnerKey, getVendorPrivate } from "@/lib/supabase/vendors";
import { supabaseGetListingsByOwner } from "@/lib/supabase/store-listings";
import { summarizeVendorEarnings } from "@/lib/supabase/vendor-earnings";
import { PLATFORM_SHARE, VENDOR_SHARE } from "@/lib/commerce/commission";
import type { VendorEarningsSummary } from "@/lib/commerce/earnings-types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const EMPTY_EARNINGS: VendorEarningsSummary = {
  salesCount: 0,
  grossThb: 0,
  vendorEarnedThb: 0,
  platformFeeThb: 0,
  pendingThb: 0,
  availableThb: 0,
  paidOutThb: 0,
  recent: [],
};

export async function GET(request: NextRequest) {
  const auth = await requireVendorSession(request);
  if (!auth.ok) return auth.response;

  const ownerKey = auth.ownerKey;

  try {
    if (auth.fromSession) {
      const viewer = getViewerFromRequest(request);
      await claimVendorOwnershipFromBrowser(ownerKey, viewer.browserId);
    }

    const [profile, priv, listings, earnings] = await Promise.all([
      getVendorByOwnerKey(ownerKey),
      getVendorPrivate(ownerKey),
      supabaseGetListingsByOwner(ownerKey),
      summarizeVendorEarnings(ownerKey).catch(() => EMPTY_EARNINGS),
    ]);

    const published = listings.filter((l) => (l.moderationStatus ?? "approved") === "approved");
    const pending = listings.filter(
      (l) => l.moderationStatus === "pending" || l.moderationStatus === "rejected",
    );

    return NextResponse.json({
      ownerKey,
      auth: {
        fromSession: auth.fromSession,
        email: auth.email,
        sessionRequired: vendorSessionRequired(),
      },
      profile,
      payout: priv?.payout ?? {},
      verificationStatus: priv?.verificationStatus ?? "unverified",
      verification: priv?.verification ?? { documents: [] },
      kyc: priv?.kyc ?? null,
      verificationRejectReason: priv?.verificationRejectReason ?? null,
      kycApproved: priv?.verificationStatus === "approved",
      listings,
      stats: {
        total: listings.length,
        published: published.length,
        pending: pending.length,
        salesCount: earnings.salesCount,
        vendorEarnedThb: earnings.vendorEarnedThb,
        availableThb: earnings.availableThb,
        paidOutThb: earnings.paidOutThb,
      },
      commission: {
        vendorShare: VENDOR_SHARE,
        platformShare: PLATFORM_SHARE,
        earnings,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load vendor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
