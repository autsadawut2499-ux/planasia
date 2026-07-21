import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authOptions, isAuthConfigured } from "@/lib/auth/options";

const nextAuthHandler = isAuthConfigured() ? NextAuth(authOptions) : null;

/** Avoid NextAuth NO_SECRET crash when OAuth env vars are not set on Vercel. */
async function disabledAuthHandler(req: Request) {
  const { pathname } = new URL(req.url);
  if (pathname.endsWith("/session")) {
    return NextResponse.json(null, { status: 200 });
  }
  if (pathname.endsWith("/_log")) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  return NextResponse.json(
    { error: "Authentication is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and NEXTAUTH_SECRET." },
    { status: 503 },
  );
}

type RouteContext = { params: Promise<{ nextauth: string[] }> };

export async function GET(req: Request, context: RouteContext) {
  if (!nextAuthHandler) return disabledAuthHandler(req);
  return nextAuthHandler(req, context);
}

export async function POST(req: Request, context: RouteContext) {
  if (!nextAuthHandler) return disabledAuthHandler(req);
  return nextAuthHandler(req, context);
}
