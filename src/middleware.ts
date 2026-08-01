import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import {
  checkRateLimit,
  maybeCleanupRateLimitStore,
  rateLimitConfigForPath,
} from "@/lib/rate-limit";
import {
  applyEdgeResponseHeaders,
  canonicalHostRedirect,
  edgeSeoRequestHeaders,
} from "@/lib/edge/seo";

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "anonymous";
  return ip;
}

function resolveAuthSecret(): string | undefined {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || undefined;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Edge SEO layer (runs first, for every matched route) ---
  const seoHeaders = edgeSeoRequestHeaders(request);
  const redirect = canonicalHostRedirect(request);
  if (redirect) return applyEdgeResponseHeaders(redirect, seoHeaders);

  // Page (non-API) requests: forward SEO hint headers to the app + set response headers.
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/admin")) {
    const response = NextResponse.next({ request: { headers: seoHeaders } });
    return applyEdgeResponseHeaders(response, seoHeaders);
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = await getToken({
      req: request,
      secret:
        resolveAuthSecret() ??
        (process.env.NODE_ENV === "development" ? "planasia-dev-only-secret-do-not-use-in-production" : undefined),
    });

    if (!token?.isAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (!pathname.startsWith("/api/")) {
    return applyEdgeResponseHeaders(NextResponse.next(), seoHeaders);
  }

  if (pathname.startsWith("/api/admin/")) {
    const token = await getToken({
      req: request,
      secret:
        resolveAuthSecret() ??
        (process.env.NODE_ENV === "development" ? "planasia-dev-only-secret-do-not-use-in-production" : undefined),
    });

    if (!token?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  maybeCleanupRateLimitStore();

  const config = rateLimitConfigForPath(pathname);
  const key = `${clientKey(request)}:${pathname.split("/").slice(0, 4).join("/")}`;
  const result = checkRateLimit(key, config);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(result.retryAfter ?? 60),
          "X-RateLimit-Remaining": "0",
        },
      },
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  return applyEdgeResponseHeaders(response, seoHeaders);
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static asset files.
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|map|txt|xml|woff|woff2|ttf)$).*)",
  ],
};
