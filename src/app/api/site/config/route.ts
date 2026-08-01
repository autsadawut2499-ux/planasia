import { NextRequest, NextResponse } from "next/server";
import type { Locale } from "@/lib/geo/countries";
import { loadSiteConfig } from "@/lib/supabase/site-config";

const CONTENT_LOCALES = new Set<Locale>(["en", "th", "hi", "vi"]);

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("locale") ?? "th";
  const locale: Locale = CONTENT_LOCALES.has(raw as Locale) ? (raw as Locale) : "th";
  const config = await loadSiteConfig(locale);
  return NextResponse.json(config, {
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}
