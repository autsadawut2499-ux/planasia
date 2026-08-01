import { NextRequest, NextResponse } from "next/server";
import { getCountryByCode, uiLocaleForCountry } from "@/lib/geo/countries";
import { currencyForCountry } from "@/lib/currency";

/**
 * Geo-detect the visitor's country (via edge IP headers or ipapi) so the client
 * can auto-select interface language and display currency.
 *
 * Returns:
 *  - countryCode:  the real detected ISO code (e.g. "MM") — used for language + currency.
 *  - storeCountry: mapped to a supported store country (units / catalog).
 *  - currency:     THB when detected country is Thailand, otherwise USD.
 *  - uiLocale:     suggested interface language for that country.
 */
export async function GET(request: NextRequest) {
  // Vercel / Cloudflare style geo headers first (fast, no external call).
  const headerCountry =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-geo-country") ??
    null;

  const build = (code: string, source: string) => {
    const upper = code.toUpperCase();
    const store = getCountryByCode(upper); // falls back to default when unsupported
    const currency = currencyForCountry(upper);
    return NextResponse.json({
      countryCode: upper,
      storeCountry: store.code,
      currency,
      uiLocale: uiLocaleForCountry(upper),
      locale: store.defaultLocale,
      unitSystem: store.unitSystem,
      source,
    });
  };

  if (headerCountry && headerCountry !== "XX") {
    return build(headerCountry, "edge-header");
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1";

  if (ip === "127.0.0.1" || ip === "::1") {
    return build("TH", "default");
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.country_code) {
        return build(String(data.country_code), "ipapi");
      }
    }
  } catch {
    /* fall through to default */
  }

  return build("TH", "fallback");
}
