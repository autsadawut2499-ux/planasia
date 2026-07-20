import type { Locale } from "@/lib/geo/countries";
import { localeName, aiRespondInLocale } from "@/lib/i18n/localized-text";
import { localeToGoogleCode } from "@/lib/translation/browser-locale";
import { getCachedTranslations, setCachedTranslations } from "@/lib/translation/cache";
import { getGeminiClient } from "@/lib/ai/gemini";

export function isTranslationConfigured(): boolean {
  return Boolean(process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GEMINI_API_KEY);
}

async function translateWithGoogle(
  texts: string[],
  targetLocale: Locale,
  sourceLocale?: Locale,
): Promise<string[]> {
  const key = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!key) throw new Error("Google Translate not configured");

  const params = new URLSearchParams();
  for (const text of texts) params.append("q", text);
  params.set("target", localeToGoogleCode(targetLocale));
  params.set("key", key);
  params.set("format", "text");
  if (sourceLocale) params.set("source", localeToGoogleCode(sourceLocale));

  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?${params.toString()}`,
    { method: "POST" },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Translate failed: ${err}`);
  }

  const data = (await res.json()) as {
    data?: { translations?: { translatedText: string }[] };
  };

  const out = data.data?.translations?.map((t) => t.translatedText) ?? [];
  if (out.length !== texts.length) {
    throw new Error("Google Translate returned unexpected result count");
  }
  return out;
}

async function translateWithGemini(
  texts: string[],
  targetLocale: Locale,
  sourceLocale?: Locale,
): Promise<string[]> {
  const client = getGeminiClient();
  if (!client) throw new Error("Gemini not configured");

  const model = client.getGenerativeModel({
    model: process.env.GEMINI_TEXT_MODEL ?? "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const target = localeName(targetLocale);
  const source = sourceLocale ? localeName(sourceLocale) : "auto-detect";

  const prompt = `You are a professional architectural and real-estate translator for an Asian house-plan marketplace.

${aiRespondInLocale(targetLocale)}

Source language hint: ${source}
Target language: ${target}

Translate each house-plan string below. Preserve numbers, floor counts, bed/bath counts, and units.
If a string is already fluent ${target}, return it unchanged.

Input strings (JSON array):
${JSON.stringify(texts)}

Return ONLY a JSON array of ${texts.length} translated strings in the same order.`;

  const result = await model.generateContent(prompt);
  const parsed = JSON.parse(result.response.text()) as string[];
  if (!Array.isArray(parsed) || parsed.length !== texts.length) {
    throw new Error("Gemini translation returned invalid JSON");
  }
  return parsed;
}

export async function translateTexts(
  texts: string[],
  targetLocale: Locale,
  sourceLocale?: Locale,
): Promise<{ translations: string[]; provider: "cache" | "google" | "gemini" | "passthrough" }> {
  if (!texts.length) {
    return { translations: [], provider: "passthrough" };
  }

  if (sourceLocale && sourceLocale === targetLocale) {
    return { translations: texts, provider: "passthrough" };
  }

  const cached = await getCachedTranslations(targetLocale, texts);
  if (cached) {
    return { translations: cached, provider: "cache" };
  }

  let translations: string[];
  let provider: "google" | "gemini" | "passthrough" = "passthrough";

  if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    try {
      translations = await translateWithGoogle(texts, targetLocale, sourceLocale);
      provider = "google";
    } catch {
      translations = texts;
    }
  } else if (process.env.GEMINI_API_KEY) {
    try {
      translations = await translateWithGemini(texts, targetLocale, sourceLocale);
      provider = "gemini";
    } catch {
      translations = texts;
    }
  } else {
    return { translations: texts, provider: "passthrough" };
  }

  if (provider !== "passthrough") {
    await setCachedTranslations(targetLocale, texts, translations);
  }

  return { translations, provider };
}
