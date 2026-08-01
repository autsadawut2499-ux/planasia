/**
 * Gemini **short-string / marketplace copy** translation workflow
 * (listing names, captions, UI batches).
 *
 * Full construction-blueprint PDF translation lives in
 * `blueprint-pdf-translation.ts` and is invoked from post-payment-translation.
 *
 * Every chunk payload includes:
 * 1. content (texts for this page/batch)
 * 2. target_country
 * 3. system_instruction (translate + strict unit conversion)
 */

import { getGeminiTextModel } from "@/lib/ai/models";
import { getGeminiClient } from "@/lib/gemini/client";
import { hasGeminiApiKey, isGeminiFeatureEnabled } from "@/lib/gemini/config";
import {
  buildGeminiTranslationPayloadBatch,
  expectedTranslationCount,
  type BuildGeminiTranslationPayloadInput,
  type GeminiTranslationApiPayload,
} from "@/lib/gemini/payloads/translation-request";
import { getGeminiSystemStatus } from "@/lib/gemini/readiness";
import type {
  GeminiTranslateRequest,
  GeminiTranslateResult,
  GeminiTranslationPaginationMeta,
} from "@/lib/gemini/types";

export function isGeminiTranslationReady(): boolean {
  return isGeminiFeatureEnabled() && hasGeminiApiKey();
}

function parseTranslationArray(raw: string, expected: number): string[] {
  const text = raw.trim();
  const candidates = [text];
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.unshift(fenced[1].trim());
  const bracket = text.match(/\[[\s\S]*\]/);
  if (bracket?.[0]) candidates.unshift(bracket[0]);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (Array.isArray(parsed) && parsed.length === expected) {
        return parsed.map((item) => String(item));
      }
      if (
        parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { translations?: unknown }).translations)
      ) {
        const arr = (parsed as { translations: unknown[] }).translations;
        if (arr.length === expected) return arr.map((item) => String(item));
      }
    } catch {
      /* try next */
    }
  }

  throw new Error(
    `Gemini translation returned invalid JSON array (expected ${expected}, preview: ${text
      .slice(0, 80)
      .replace(/\s+/g, " ")}…)`,
  );
}

function payloadSummary(payload: GeminiTranslationApiPayload) {
  return {
    content: payload.content,
    target_country: payload.target_country,
    system_instruction: payload.system_instruction,
  };
}

/**
 * Execute a single 3-part chunk payload against the Gemini API.
 */
export async function sendGeminiTranslationPayload(
  payload: GeminiTranslationApiPayload,
): Promise<GeminiTranslateResult> {
  const summary = payloadSummary(payload);

  if (!isGeminiTranslationReady()) {
    return {
      translations: payload.content.texts,
      provider: "passthrough",
      context: payload.regional_context,
      payload: summary,
    };
  }

  const client = getGeminiClient();
  if (!client) {
    return {
      translations: payload.content.texts,
      provider: "passthrough",
      context: payload.regional_context,
      payload: summary,
    };
  }

  const expected = expectedTranslationCount(payload);
  const attempts: Array<{ jsonMode: boolean }> = [{ jsonMode: true }, { jsonMode: false }];
  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      const model = client.getGenerativeModel({
        model: getGeminiTextModel(),
        systemInstruction: payload.system_instruction,
        ...(attempt.jsonMode
          ? { generationConfig: { responseMimeType: "application/json" } }
          : {}),
      });
      const result = await model.generateContent(payload.user_message);
      const translations = parseTranslationArray(result.response.text(), expected);
      return {
        translations,
        provider: "gemini",
        context: payload.regional_context,
        payload: summary,
      };
    } catch (err) {
      lastError = err;
    }
  }

  console.error(
    "[gemini/translate]",
    lastError instanceof Error ? lastError.message : lastError,
    {
      target_country: payload.target_country,
      chunk: payload.pagination
        ? `${payload.pagination.chunkIndex + 1}/${payload.pagination.totalChunks}`
        : "single",
      units: payload.regional_context.unit_conversion_rule.units,
    },
  );
  throw lastError instanceof Error ? lastError : new Error("Gemini translation failed");
}

/**
 * Primary workflow: chunk document/texts, send each chunk with full country +
 * unit rules, then concatenate translations in order.
 */
export async function runGeminiTranslationWorkflow(
  input: BuildGeminiTranslationPayloadInput,
): Promise<GeminiTranslateResult> {
  const payloads = buildGeminiTranslationPayloadBatch(input);
  const first = payloads[0]!;
  const translations: string[] = [];
  const documentParts: string[] = [];
  let provider: GeminiTranslateResult["provider"] = "passthrough";
  let hadDocumentChunks = false;

  const chunksMeta: GeminiTranslationPaginationMeta["chunks"] = [];

  for (const payload of payloads) {
    const part = await sendGeminiTranslationPayload(payload);
    translations.push(...part.translations);
    if (part.provider === "gemini") provider = "gemini";

    const isDocument = payload.pagination?.isDocument ?? false;
    if (isDocument) {
      hadDocumentChunks = true;
      documentParts.push(...part.translations);
    }

    chunksMeta.push({
      chunkIndex: payload.pagination?.chunkIndex ?? 0,
      pageIndexes: payload.pagination?.pageIndexes ?? [],
      inputCount: payload.content.texts.length,
      outputCount: part.translations.length,
      isDocument,
    });
  }

  const pagination: GeminiTranslationPaginationMeta = {
    totalChunks: payloads.length,
    pagesPerBatch: input.chunking?.pagesPerBatch,
    textsPerBatch: input.chunking?.textsPerBatch,
    mode: input.chunking?.mode ?? "page",
    chunks: chunksMeta,
  };

  return {
    translations,
    document_translation: hadDocumentChunks
      ? documentParts.join("\n\n")
      : undefined,
    provider,
    context: first.regional_context,
    payload: payloadSummary(first),
    pagination,
  };
}

/**
 * Compatibility entry used by `/api/gemini/translate`.
 */
export async function translateWithGeminiCapability(
  request: GeminiTranslateRequest,
): Promise<GeminiTranslateResult> {
  return runGeminiTranslationWorkflow({
    content: {
      texts: request.texts,
      document: request.document,
    },
    target_country: request.context?.target_country ?? request.target_country ?? "",
    target_locale: request.targetLocale,
    source_locale: request.sourceLocale,
    chunking: request.chunking,
  });
}

export function geminiTranslationCapabilityEnabled(): boolean {
  return getGeminiSystemStatus().capabilities.translation && isGeminiTranslationReady();
}

/** Preview how a document would be chunked (no API call). */
export function previewGeminiTranslationChunks(
  input: BuildGeminiTranslationPayloadInput,
): GeminiTranslationApiPayload[] {
  return buildGeminiTranslationPayloadBatch(input);
}
