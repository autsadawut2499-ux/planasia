import type { UiLocale } from "@/lib/geo/countries";
import { localeName, aiRespondInLocale } from "@/lib/i18n/localized-text";
import { localeToGoogleCode } from "@/lib/translation/browser-locale";
import { getCachedTranslations, setCachedTranslations } from "@/lib/translation/cache";
import { getGeminiClient } from "@/lib/ai/gemini";
import { getGeminiTextModel } from "@/lib/ai/models";

export function isTranslationConfigured(): boolean {
  return Boolean(process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GEMINI_API_KEY);
}

async function translateWithGoogle(
  texts: string[],
  targetLocale: UiLocale,
  sourceLocale?: UiLocale,
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

export interface TranslateOptions {
  /** Extra instruction appended to the Gemini system prompt (e.g. number lock). */
  systemExtra?: string;
}

async function translateWithGemini(
  texts: string[],
  targetLocale: UiLocale,
  sourceLocale?: UiLocale,
  options?: TranslateOptions,
): Promise<string[]> {
  const client = getGeminiClient();
  if (!client) throw new Error("Gemini not configured");

  const modelId = getGeminiTextModel();
  const target = localeName(targetLocale);
  const source = sourceLocale ? localeName(sourceLocale) : "auto-detect";

  const prompt = `Translate house-plan marketplace strings into ${target}.
Source language hint: ${source}.
${aiRespondInLocale(targetLocale)}
NUMBER LOCK: never change digits (prices, beds, baths, floors, m², metres, plan IDs).
If already fluent ${target}, keep unchanged.
${options?.systemExtra ? `${options.systemExtra}\n` : ""}
INPUT (JSON array of ${texts.length} strings):
${JSON.stringify(texts)}

OUTPUT RULES (mandatory):
- Reply with ONLY a JSON array of exactly ${texts.length} strings
- No markdown, no code fences, no role text, no explanation
- Example shape: ["translated one","translated two"]`;

  // Gemma / some models ignore responseMimeType and emit prose — try JSON mode
  // first, then plain text, then a minimal retry prompt.
  const attempts: Array<{ jsonMode: boolean; prompt: string }> = [
    { jsonMode: true, prompt },
    { jsonMode: false, prompt },
    {
      jsonMode: false,
      prompt: `Return ONLY valid JSON array with ${texts.length} ${target} translations of:\n${JSON.stringify(texts)}`,
    },
  ];

  let lastPreview = "";
  for (const attempt of attempts) {
    const model = client.getGenerativeModel({
      model: modelId,
      ...(attempt.jsonMode
        ? { generationConfig: { responseMimeType: "application/json" } }
        : {}),
    });
    const result = await model.generateContent(attempt.prompt);
    const raw = result.response.text().trim();
    lastPreview = raw.slice(0, 80).replace(/\s+/g, " ");
    const parsed = parseGeminiTranslationArray(raw, texts.length);
    if (parsed) return parsed;
  }

  throw new Error(`Gemini translation returned invalid JSON (${lastPreview}…)`);
}

/** Extract a string[] from model output that may wrap JSON in markdown/prose. */
function parseGeminiTranslationArray(raw: string, expectedLength: number): string[] | null {
  const candidates = [raw];
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.unshift(fenced[1].trim());
  const bracket = raw.match(/\[[\s\S]*\]/);
  if (bracket?.[0]) candidates.unshift(bracket[0]);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (Array.isArray(parsed) && parsed.length === expectedLength && parsed.every((x) => typeof x === "string")) {
        return parsed;
      }
      // Some models return { translations: [...] }
      if (
        parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { translations?: unknown }).translations)
      ) {
        const arr = (parsed as { translations: unknown[] }).translations;
        if (arr.length === expectedLength && arr.every((x) => typeof x === "string")) {
          return arr as string[];
        }
      }
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

export async function translateTexts(
  texts: string[],
  targetLocale: UiLocale,
  sourceLocale?: UiLocale,
  options?: TranslateOptions,
): Promise<{
  translations: string[];
  provider: "cache" | "google" | "gemini" | "passthrough";
  providerError?: string;
}> {
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
  let providerError: string | undefined;

  if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    try {
      translations = await translateWithGoogle(texts, targetLocale, sourceLocale);
      provider = "google";
    } catch (err) {
      translations = texts;
      providerError = err instanceof Error ? err.message : String(err);
    }
  } else if (process.env.GEMINI_API_KEY) {
    try {
      translations = await translateWithGemini(texts, targetLocale, sourceLocale, options);
      provider = "gemini";
    } catch (err) {
      translations = texts;
      providerError = err instanceof Error ? err.message : String(err);
    }
  } else {
    return { translations: texts, provider: "passthrough" };
  }

  if (provider !== "passthrough") {
    await setCachedTranslations(targetLocale, texts, translations);
  }

  return { translations, provider, ...(providerError ? { providerError } : {}) };
}
