import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/auth";
import {
  createPrivateSignedReadUrl,
  isPrivateAssetRef,
  parsePrivateAssetRef,
} from "@/lib/supabase/private-assets";
import { requireVendorSession } from "@/lib/vendor/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/vendor/assets/view?ref=planasia-private://vendor-private/...
 * Short-lived redirect for owners (or admins) to preview private KYC / PDFs.
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref")?.trim() || "";
  if (!ref || !isPrivateAssetRef(ref)) {
    return NextResponse.json({ error: "Invalid asset ref" }, { status: 400 });
  }

  const parsed = parsePrivateAssetRef(ref);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid asset ref" }, { status: 400 });
  }

  const admin = await getAdminSession();
  if (!admin) {
    const auth = await requireVendorSession(request);
    if (!auth.ok) return auth.response;

    const safeOwner = auth.ownerKey.replace(/[^a-zA-Z0-9_-]/g, "_");
    if (!parsed.path.startsWith(`vendor/${safeOwner}/`)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const signed = await createPrivateSignedReadUrl(ref, 60 * 30);
  if (!signed) {
    return NextResponse.json({ error: "Could not sign asset" }, { status: 502 });
  }

  return NextResponse.redirect(signed, 302);
}
