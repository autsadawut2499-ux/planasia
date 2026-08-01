import { NextRequest, NextResponse } from "next/server";
import type { UiLocale } from "@/lib/geo/countries";
import { isTranslationConfigured, translateTexts } from "@/lib/translation/service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const texts = (body.texts as string[]) ?? [];
  const targetLocale = (body.targetLocale as UiLocale) ?? "en";
  const sourceLocale = body.sourceLocale as UiLocale | undefined;

  if (!texts.length) {
    return NextResponse.json({ error: "texts required" }, { status: 400 });
  }

  if (texts.length > 20) {
    return NextResponse.json({ error: "Maximum 20 texts per request" }, { status: 400 });
  }

  const sanitized = texts.map((t) => String(t).slice(0, 2000));
  const result = await translateTexts(sanitized, targetLocale, sourceLocale);

  return NextResponse.json({
    translations: result.translations,
    provider: result.provider,
    configured: isTranslationConfigured(),
    ...(result.providerError && process.env.NODE_ENV !== "production"
      ? { providerError: result.providerError }
      : {}),
  });
}

export async function GET() {
  return NextResponse.json({
    configured: isTranslationConfigured(),
    providers: {
      google: Boolean(process.env.GOOGLE_TRANSLATE_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY),
    },
  });
}
