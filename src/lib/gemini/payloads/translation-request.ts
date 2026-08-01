/**
 * Structured Gemini translation request payload.
 *
 * Every translation call MUST include these three components together:
 * 1. content — document / text(s) to translate
 * 2. target_country — ISO code used to look up unit conversion rules
 * 3. system_instruction — translate + strict unit conversion for that country
 *
 * Long documents are split via {@link buildTranslationChunks} and each chunk
 * gets its own full 3-part payload (same country + unit rules every time).
 */

import type { UiLocale } from "@/lib/geo/countries";
import {
  createGeminiRegionalContext,
  type GeminiRegionalContext,
  type TargetCountryCode,
} from "@/lib/gemini/core-config";
import {
  type ContentChunk,
  type TranslationChunkingOptions,
  buildTranslationChunks,
  resolveChunkingOptions,
} from "@/lib/gemini/payloads/chunking";
import { buildRegionalUnitDocument } from "@/lib/gemini/prompts/translate-with-units";
import { aiRespondInLocale, localeName } from "@/lib/i18n/localized-text";

/** (1) Text / document content to translate. */
export interface GeminiTranslationContent {
  /** One or more strings (marketplace copy, specs, captions). */
  texts: string[];
  /** Optional longer document body (chunked page-by-page / by section). */
  document?: string;
}

/**
 * Canonical 3-part payload for a Gemini translation API request.
 * Build with {@link buildGeminiTranslationPayload} — do not assemble ad hoc.
 */
export interface GeminiTranslationApiPayload {
  /** (1) Content to translate (this chunk only). */
  content: GeminiTranslationContent;
  /** (2) Target country code → unit rules via GEMINI_COUNTRY_UNIT_MAP. */
  target_country: string;
  /**
   * (3) System instruction sent as Gemini `systemInstruction`.
   * Instructs: translate + strictly convert measurements to designated units.
   */
  system_instruction: string;

  /** Resolved coupled regional context (country + unit_conversion_rule). */
  regional_context: GeminiRegionalContext;
  /** User-turn message (content + unit document + language hints). */
  user_message: string;
  target_locale: UiLocale;
  source_locale?: UiLocale;
  /** Pagination metadata for this chunk (undefined = single-shot / no chunking). */
  pagination?: {
    chunkIndex: number;
    totalChunks: number;
    pageIndexes: number[];
    isDocument: boolean;
  };
}

export interface BuildGeminiTranslationPayloadInput {
  /** Text strings and/or a document body. */
  content: GeminiTranslationContent;
  /** Country code (e.g. TH, PH, IN) — required. */
  target_country: TargetCountryCode;
  target_locale?: UiLocale;
  source_locale?: UiLocale;
  /** Pagination / batch controls for large documents. */
  chunking?: TranslationChunkingOptions | null;
}

export const TRANSLATE_AND_CONVERT_UNITS_INSTRUCTION =
  "Translate the text and strictly convert all measurement units to match the specific units designated for the target country according to our predefined configuration.";

/** System instruction (component 3) — fixed product rule + locale voice. */
export function buildTranslationSystemInstruction(
  targetLocale: UiLocale,
  regional: GeminiRegionalContext,
): string {
  const rule = regional.unit_conversion_rule;
  return [
    "You are a professional architectural and real-estate translator for an Asian house-plan marketplace.",
    aiRespondInLocale(targetLocale),
    "",
    TRANSLATE_AND_CONVERT_UNITS_INSTRUCTION,
    "",
    `Target country code: ${regional.target_country}`,
    `Country: ${rule.country_name}`,
    `Designated linear units (ONLY these may appear for measurements): ${rule.units.join(", ")}`,
    `Primary unit: ${rule.primary_unit}`,
    `Display system: ${rule.display}`,
    "",
    "Rules:",
    "- Translate into the requested target language.",
    "- Recalculate measurement numbers when converting unit systems (metric ↔ imperial).",
    "- Prefer the primary unit unless another designated unit is clearly more precise.",
    "- Area: imperial markets → sq ft; metric markets → m² (or local equivalent).",
    "- Do not invent units outside the designated list for this country.",
    "- NUMBER LOCK for non-measurements: prices, bed/bath/floor counts, plan codes, phones, postal codes stay unchanged.",
    "- This request may be ONE CHUNK of a longer document. Translate only the content in this chunk; do not summarize or omit sections.",
    "- Keep terminology consistent as if continuing the same document.",
    "- Return ONLY a JSON array of translated strings in the same order as the input texts array. No markdown.",
  ].join("\n");
}

/** User message bundling content (1) + country lookup document (2). */
export function buildTranslationUserMessage(params: {
  content: GeminiTranslationContent;
  regional: GeminiRegionalContext;
  targetLocale: UiLocale;
  sourceLocale?: UiLocale;
  pagination?: GeminiTranslationApiPayload["pagination"];
}): string {
  const { content, regional, targetLocale, sourceLocale, pagination } = params;
  const unitDocument = buildRegionalUnitDocument(regional);
  const target = localeName(targetLocale);
  const source = sourceLocale ? localeName(sourceLocale) : "auto-detect";

  const parts: string[] = [
    "## Target country",
    `target_country: ${regional.target_country}`,
    "",
    "## Predefined unit configuration document",
    unitDocument,
    "",
    "## Languages",
    `source: ${source}`,
    `target: ${target}`,
  ];

  if (pagination) {
    parts.push(
      "",
      "## Pagination",
      `chunk: ${pagination.chunkIndex + 1} of ${pagination.totalChunks}`,
      pagination.pageIndexes.length
        ? `source_pages: ${pagination.pageIndexes.map((p) => p + 1).join(", ")}`
        : "source_pages: (string batch)",
      pagination.isDocument
        ? "kind: document_pages"
        : "kind: text_batch",
    );
  }

  parts.push(
    "",
    "## Content to translate",
    `texts (${content.texts.length} items, JSON array):`,
    JSON.stringify(content.texts),
    "",
    `Return a JSON array of exactly ${content.texts.length} strings.`,
  );

  return parts.join("\n");
}

function normalizeShortContent(content: GeminiTranslationContent): GeminiTranslationContent {
  const texts = (content.texts ?? [])
    .map((t) => String(t).trim())
    .filter(Boolean)
    .map((t) => t.slice(0, 4000))
    .slice(0, 20);

  const document = content.document?.trim() || undefined;

  if (!texts.length && document) {
    return { texts: [document], document: undefined };
  }

  return { texts, document };
}

/**
 * Build one 3-component payload for a single chunk (or a small unchunked job).
 */
export function buildGeminiTranslationPayload(
  input: BuildGeminiTranslationPayloadInput,
  chunkMeta?: {
    chunk: ContentChunk;
    totalChunks: number;
  },
): GeminiTranslationApiPayload {
  const target_country = String(input.target_country ?? "").trim().toUpperCase();
  if (!target_country) {
    throw new Error("[gemini] target_country is required on every translation payload");
  }

  const content: GeminiTranslationContent = chunkMeta
    ? { texts: chunkMeta.chunk.texts }
    : normalizeShortContent(input.content);

  if (!content.texts.length) {
    throw new Error("[gemini] content.texts (or content.document) is required");
  }

  const target_locale = input.target_locale ?? "en";
  const regional_context = createGeminiRegionalContext(target_country);
  const system_instruction = buildTranslationSystemInstruction(
    target_locale,
    regional_context,
  );

  const pagination = chunkMeta
    ? {
        chunkIndex: chunkMeta.chunk.chunkIndex,
        totalChunks: chunkMeta.totalChunks,
        pageIndexes: chunkMeta.chunk.pageIndexes,
        isDocument: chunkMeta.chunk.isDocument,
      }
    : undefined;

  const user_message = buildTranslationUserMessage({
    content,
    regional: regional_context,
    targetLocale: target_locale,
    sourceLocale: input.source_locale,
    pagination,
  });

  return {
    content,
    target_country: regional_context.target_country,
    system_instruction,
    regional_context,
    user_message,
    target_locale,
    source_locale: input.source_locale,
    pagination,
  };
}

/**
 * Build an ordered list of 3-part payloads — one per chunk.
 * Each payload repeats target_country + system_instruction + unit rules.
 */
export function buildGeminiTranslationPayloadBatch(
  input: BuildGeminiTranslationPayloadInput,
): GeminiTranslationApiPayload[] {
  const texts = (input.content.texts ?? []).map((t) => String(t).trim()).filter(Boolean);
  const document = input.content.document?.trim();

  if (!texts.length && !document) {
    throw new Error("[gemini] content.texts (or content.document) is required");
  }

  const chunks = buildTranslationChunks({
    texts,
    document,
    chunking: input.chunking,
  });

  if (!chunks.length) {
    throw new Error("[gemini] no content chunks to translate");
  }

  return chunks.map((chunk) =>
    buildGeminiTranslationPayload(input, {
      chunk,
      totalChunks: chunks.length,
    }),
  );
}

/** Expected output length for a single chunk payload. */
export function expectedTranslationCount(payload: GeminiTranslationApiPayload): number {
  return payload.content.texts.length;
}

export { resolveChunkingOptions, buildTranslationChunks };
export type { TranslationChunkingOptions, ContentChunk };
