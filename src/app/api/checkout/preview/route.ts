import { NextRequest, NextResponse } from "next/server";
import { isUiLocale, type UiLocale, type UnitSystem } from "@/lib/geo/countries";
import type { Currency } from "@/lib/currency";
import { buildCheckoutPreview } from "@/lib/checkout/pipeline";
import { isUpsellAddonId, type UpsellAddonId } from "@/lib/store/cart-pricing";

export const dynamic = "force-dynamic";

/**
 * Pre-checkout review payload (no Gemini).
 * Programmatic unit preview for the selected target country.
 * Gemini translate + unit conversion runs only after payment succeeds.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const listingIds = Array.isArray(body.listingIds)
      ? body.listingIds.map((id: unknown) => String(id)).filter(Boolean).slice(0, 20)
      : [];
    if (listingIds.length === 0) {
      return NextResponse.json({ error: "listingIds required" }, { status: 400 });
    }

    const uiLocale: UiLocale = isUiLocale(body.uiLocale) ? body.uiLocale : "th";
    const countryCode = String(body.countryCode ?? "TH").toUpperCase();
    const target_country = String(
      body.target_country ?? body.targetCountry ?? countryCode,
    ).toUpperCase();
    const currency =
      body.currency === "THB" || body.currency === "USD"
        ? (body.currency as Currency)
        : "THB";
    const unitSystem: UnitSystem | undefined =
      body.unitSystem === "metric" || body.unitSystem === "imperial"
        ? body.unitSystem
        : undefined;
    const rawAddons = Array.isArray(body.addons) ? (body.addons as unknown[]) : [];
    const addons = rawAddons.filter((a): a is UpsellAddonId => isUpsellAddonId(a));

    const preview = await buildCheckoutPreview({
      listingIds,
      uiLocale,
      countryCode,
      target_country,
      currency,
      unitSystem,
      addons,
    });

    return NextResponse.json(preview);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Preview failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
