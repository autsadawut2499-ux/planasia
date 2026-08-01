import "server-only";

import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth/options";
import { isProductionRuntime } from "@/lib/payments/config";
import { getViewerFromRequest } from "@/lib/user/identity";

export type VendorAuthOk = {
  ok: true;
  ownerKey: string;
  sessionUserId: string | null;
  email: string | null;
  /** True when identity came from NextAuth (not spoofable headers). */
  fromSession: boolean;
};

export type VendorAuthFail = {
  ok: false;
  response: NextResponse;
};

/**
 * Production: vendor mutations require a Google/NextAuth session.
 * Owner key = session.user.id (stable OAuth subject).
 *
 * Non-production: may fall back to browser headers unless
 * VENDOR_REQUIRE_SESSION=true.
 */
export function vendorSessionRequired(): boolean {
  if (process.env.VENDOR_REQUIRE_SESSION === "true") return true;
  if (process.env.VENDOR_REQUIRE_SESSION === "false") return false;
  return isProductionRuntime();
}

/** @deprecated Prefer requireVendorSession — header-only identity is spoofable. */
export function getVendorOwnerKey(request: NextRequest): string | null {
  const viewer = getViewerFromRequest(request);
  const key = viewer.sessionUserId || viewer.primaryId || viewer.browserId;
  return key && key.trim() ? key.trim() : null;
}

export async function requireVendorSession(
  request: NextRequest,
): Promise<VendorAuthOk | VendorAuthFail> {
  const session = await getServerSession(authOptions);
  const sessionUserId = session?.user?.id?.trim() || null;
  const email = session?.user?.email?.trim() || null;

  if (sessionUserId) {
    return {
      ok: true,
      ownerKey: sessionUserId,
      sessionUserId,
      email,
      fromSession: true,
    };
  }

  if (vendorSessionRequired()) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Authentication required",
          code: "VENDOR_AUTH_REQUIRED",
          message: "กรุณาเข้าสู่ระบบด้วย Google ก่อนใช้งานแดชบอร์ดผู้ขาย",
        },
        { status: 401 },
      ),
    };
  }

  // Dev / explicit opt-out only — never in production (see vendorSessionRequired).
  const fallback = getVendorOwnerKey(request);
  if (!fallback) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Vendor identity required",
          code: "VENDOR_IDENTITY_REQUIRED",
          message: "ต้องระบุตัวตนผู้ขาย หรือเข้าสู่ระบบด้วย Google",
        },
        { status: 401 },
      ),
    };
  }

  return {
    ok: true,
    ownerKey: fallback,
    sessionUserId: null,
    email: null,
    fromSession: false,
  };
}
