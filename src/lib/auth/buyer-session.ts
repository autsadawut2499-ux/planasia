import "server-only";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions, isGoogleAuthConfigured } from "@/lib/auth/options";

export interface BuyerSession {
  userId: string;
  email: string;
  name: string;
}

export interface BuyerCheckoutIdentity extends BuyerSession {
  phone?: string;
  phoneRaw: string;
}

/**
 * Require a signed-in Google (or authenticated) buyer for checkout.
 * Returns null when unauthenticated / missing email.
 */
export async function requireBuyerSession(): Promise<BuyerSession | null> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id?.trim();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!userId || !email) return null;
  return {
    userId,
    email,
    name: session?.user?.name?.trim() || email.split("@")[0] || "Buyer",
  };
}

export function googleLoginRequiredResponse() {
  return {
    error: isGoogleAuthConfigured()
      ? "Sign in with Google to continue checkout"
      : "Google login is not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)",
    code: "AUTH_REQUIRED" as const,
  };
}

/**
 * Resolve buyer identity from the signed-in session, with optional form overrides.
 * Phone stays optional; name/email fall back to the Google profile.
 */
export function resolveBuyerCheckoutIdentity(
  session: BuyerSession,
  body: Record<string, unknown>,
): BuyerCheckoutIdentity {
  const phoneRaw = String(body.buyerPhone ?? "").trim();
  const phoneDigits = phoneRaw.replace(/\D/g, "");
  return {
    userId: session.userId,
    name: String(body.buyerName ?? "").trim() || session.name,
    email:
      String(body.buyerEmail ?? "").trim().toLowerCase() || session.email,
    phoneRaw,
    phone: phoneDigits || undefined,
  };
}

/** Validate buyer contact fields used by purchase + cart checkout. */
export function validateBuyerCheckoutIdentity(
  buyer: BuyerCheckoutIdentity,
): NextResponse | null {
  if (buyer.name.length < 2) {
    return NextResponse.json(
      { error: "Buyer name is required" },
      { status: 400 },
    );
  }
  if (buyer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }
  const digits = buyer.phoneRaw.replace(/\D/g, "");
  if (buyer.phoneRaw && (digits.length < 8 || digits.length > 15)) {
    return NextResponse.json(
      { error: "Invalid phone number" },
      { status: 400 },
    );
  }
  return null;
}
