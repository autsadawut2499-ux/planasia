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
 * Optional signed-in Google (or authenticated) buyer.
 * Returns null when unauthenticated / missing email — guest checkout is allowed.
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
 * Resolve buyer identity from optional session + form fields.
 * Guests must supply name and email/phone via the body; signed-in buyers
 * fall back to Google profile when form fields are empty.
 */
export function resolveBuyerCheckoutIdentity(
  session: BuyerSession | null,
  body: Record<string, unknown>,
  fallbackUserId = "",
): BuyerCheckoutIdentity {
  const phoneRaw = String(body.buyerPhone ?? "").trim();
  const phoneDigits = phoneRaw.replace(/\D/g, "");
  const formName = String(body.buyerName ?? "").trim();
  const formEmail = String(body.buyerEmail ?? "").trim().toLowerCase();

  if (session) {
    return {
      userId: session.userId,
      name: formName || session.name,
      email: formEmail || session.email,
      phoneRaw,
      phone: phoneDigits || undefined,
    };
  }

  return {
    userId: fallbackUserId,
    name: formName,
    email: formEmail,
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
  if (!buyer.email && !buyer.phone) {
    return NextResponse.json(
      { error: "Email or phone is required" },
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
