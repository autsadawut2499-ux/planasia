import { NextRequest, NextResponse } from "next/server";
import { getCountryByCode, type Locale } from "@/lib/geo/countries";

const IP_COUNTRY_MAP: Record<string, string> = {
  TH: "TH",
  IN: "IN",
  VN: "VN",
  MY: "MY",
  ID: "ID",
  US: "US",
  SG: "MY",
  KH: "VN",
  LA: "TH",
  MM: "TH",
};

export async function GET(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "127.0.0.1";

  if (ip === "127.0.0.1" || ip === "::1") {
    const country = getCountryByCode("TH");
    return NextResponse.json({
      countryCode: country.code,
      locale: country.defaultLocale as Locale,
      unitSystem: country.unitSystem,
      source: "default",
    });
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      const mappedCode = IP_COUNTRY_MAP[data.country_code] ?? "TH";
      const country = getCountryByCode(mappedCode);
      return NextResponse.json({
        countryCode: country.code,
        locale: country.defaultLocale,
        unitSystem: country.unitSystem,
        source: "ipapi",
      });
    }
  } catch {
    /* fall through to default */
  }

  const country = getCountryByCode("TH");
  return NextResponse.json({
    countryCode: country.code,
    locale: country.defaultLocale,
    unitSystem: country.unitSystem,
    source: "fallback",
  });
}
