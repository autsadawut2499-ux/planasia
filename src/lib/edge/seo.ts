import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { currencyForCountry } from "@/lib/currency";

/**
 * Edge SEO layer — runs in the Edge runtime (Vercel's global network, closest to
 * the visitor). Handles the work that should happen before the app renders:
 *  - Canonical host enforcement (avoid duplicate-content across www/apex).
 *  - Bot management: flag crawlers so downstream can serve fully-rendered,
 *    cache-friendly responses without personalisation.
 *  - Geo/locale/currency hints (th-TH/THB by default) exposed as request headers.
 *  - Baseline security + performance headers.
 */

const BOT_PATTERN =
  /(googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|sogou|exabot|facebot|facebookexternalhit|ia_archiver|twitterbot|linkedinbot|applebot|petalbot|ahrefsbot|semrushbot|discordbot|telegrambot|whatsapp)/i;

export function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_PATTERN.test(userAgent);
}

function geoCountry(request: NextRequest): string {
  // Vercel exposes request.geo; fall back to the CDN header, then TH default.
  const geo = (request as unknown as { geo?: { country?: string } }).geo;
  return (
    geo?.country ||
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    "TH"
  );
}

function localeHint(request: NextRequest, country: string): "th" | "en" {
  const accept = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (country === "TH") return "th";
  if (accept.includes("th")) return "th";
  if (accept.includes("en")) return "en";
  return "th"; // Thai-first product
}

/** Display currency from visitor country (THB default). */
function currencyHint(country: string): string {
  return currencyForCountry(country);
}

/**
 * Enforce the canonical host if CANONICAL_HOST is configured. Returns a redirect
 * response (308) when the host differs, otherwise null. Localhost/preview are
 * left untouched so dev never breaks.
 */
export function canonicalHostRedirect(request: NextRequest): NextResponse | null {
  const canonicalHost = process.env.CANONICAL_HOST?.trim();
  if (!canonicalHost) return null;
  const host = request.headers.get("host") ?? "";
  if (!host || host === canonicalHost) return null;
  if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) return null;

  const url = request.nextUrl.clone();
  url.host = canonicalHost;
  url.protocol = "https:";
  url.port = "";
  return NextResponse.redirect(url, 308);
}

/** Compute the SEO hint headers for the incoming request. */
export function edgeSeoRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  const country = geoCountry(request);
  const locale = localeHint(request, country);
  const bot = isBot(request.headers.get("user-agent"));

  headers.set("x-geo-country", country);
  headers.set("x-locale-hint", locale);
  headers.set("x-currency-hint", currencyHint(country));
  headers.set("x-is-bot", bot ? "1" : "0");
  return headers;
}

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-DNS-Prefetch-Control": "on",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/** Attach security + geo/bot response headers (visible for debugging/analytics). */
export function applyEdgeResponseHeaders(response: NextResponse, hints: Headers): NextResponse {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) response.headers.set(k, v);
  response.headers.set("x-geo-country", hints.get("x-geo-country") ?? "TH");
  response.headers.set("x-locale-hint", hints.get("x-locale-hint") ?? "th");
  response.headers.set("x-currency-hint", hints.get("x-currency-hint") ?? "THB");
  response.headers.set("x-is-bot", hints.get("x-is-bot") ?? "0");
  return response;
}
