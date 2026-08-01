import { NextRequest, NextResponse } from "next/server";
import type { UiLocale, UnitSystem } from "@/lib/geo/countries";
import {
  convertUnitsWithGeminiCapability,
  createGeminiRegionalContext,
  isGeminiRegionalContext,
} from "@/lib/gemini";

export const dynamic = "force-dynamic";

/**
 * Structural route for unit conversion (metric ↔ imperial display).
 * Requires coupled context { target_country, unit_conversion_rule }.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const values = Array.isArray(body?.values) ? body.values : [];
  const locale = body?.locale as UiLocale | undefined;

  if (!values.length) {
    return NextResponse.json({ error: "values required" }, { status: 400 });
  }

  const context = isGeminiRegionalContext(body?.context)
    ? body.context
    : body?.target_country
      ? createGeminiRegionalContext(
          String(body.target_country),
          (body.unit_override as UnitSystem | undefined) ?? null,
        )
      : null;

  if (!context) {
    return NextResponse.json(
      {
        error:
          "context required — pass { context: { target_country, unit_conversion_rule } } or target_country",
      },
      { status: 400 },
    );
  }

  const result = await convertUnitsWithGeminiCapability({
    context,
    values: values.slice(0, 50).map((v: Record<string, unknown>, i: number) => ({
      id: String(v.id ?? `v${i}`),
      kind: v.kind === "area" ? "area" : "linear",
      metricValue: Number(v.metricValue ?? 0),
    })),
    locale,
  });

  return NextResponse.json({
    ...result,
    note: "Structure ready — pure conversion active; Gemini assist pending next instruction",
  });
}
