/**
 * Shared contracts for the Gemini integration layer.
 * Full prompt / provider logic lands in a later step — keep this file types-only.
 *
 * Regional fields always use {@link GeminiRegionalContext}:
 * `target_country` + `unit_conversion_rule` as one coupled payload.
 */

import type { UiLocale, UnitSystem } from "@/lib/geo/countries";
import type { GeminiRegionalContext } from "@/lib/gemini/core-config";

export type GeminiCapability =
  | "text"
  | "image"
  | "translation"
  | "unitConversion";

export interface GeminiSystemStatus {
  /** True when GEMINI_API_KEY is present and the feature flag allows use. */
  enabled: boolean;
  configured: boolean;
  textModel: string;
  imageModel: string;
  capabilities: Record<GeminiCapability, boolean>;
}

/** Pagination controls for large documents (see payloads/chunking). */
export interface GeminiTranslateChunkingRequest {
  mode?: "page" | "section" | "batch";
  /** Pages/sections per Gemini call (default 1). */
  pagesPerBatch?: number;
  /** Marketplace strings per Gemini call (default 8). */
  textsPerBatch?: number;
  /** Soft max source characters per call (default 6000). */
  maxCharsPerChunk?: number;
}

/** Dynamic marketplace / UI string translation (locale ↔ locale). */
export interface GeminiTranslateRequest {
  /**
   * Preferred: coupled regional context.
   * If omitted, `target_country` is required and context is resolved from the unit table.
   */
  context?: GeminiRegionalContext;
  /** Required when `context` is omitted. */
  target_country?: string;
  texts: string[];
  /** Optional longer document body (component 1 alongside texts). */
  document?: string;
  targetLocale: UiLocale;
  sourceLocale?: UiLocale;
  /** Preserve digits / plan metrics (beds, baths, m², prices). */
  numberLock?: boolean;
  /** Page-by-page / batch processing controls. */
  chunking?: GeminiTranslateChunkingRequest;
}

export interface GeminiTranslationPaginationMeta {
  totalChunks: number;
  mode: "page" | "section" | "batch";
  pagesPerBatch?: number;
  textsPerBatch?: number;
  chunks: Array<{
    chunkIndex: number;
    pageIndexes: number[];
    inputCount: number;
    outputCount: number;
    isDocument: boolean;
  }>;
}

export interface GeminiTranslateResult {
  translations: string[];
  /**
   * Document pages reassembled in order (joined with blank lines).
   * Present only when a `document` was supplied.
   */
  document_translation?: string;
  provider: "gemini" | "passthrough";
  /** Echo of the coupled regional context used for the call. */
  context: GeminiRegionalContext;
  /** The 3 required payload components from the first chunk (shape reference). */
  payload: {
    content: { texts: string[]; document?: string };
    target_country: string;
    system_instruction: string;
  };
  /** Chunking / pagination report for the job. */
  pagination?: GeminiTranslationPaginationMeta;
}

/**
 * Unit conversion for storefront / drawings.
 * Canonical geometry stays metric; display follows `context.unit_conversion_rule`.
 */
export interface GeminiUnitConvertRequest {
  /** Coupled country + unit rule — do not pass unitSystem separately. */
  context: GeminiRegionalContext;
  /** Values in canonical metric (meters or m²). */
  values: Array<{
    id: string;
    kind: "linear" | "area";
    metricValue: number;
  }>;
  locale?: UiLocale;
}

export interface GeminiUnitConvertResult {
  values: Array<{
    id: string;
    kind: "linear" | "area";
    metricValue: number;
    display: string;
  }>;
  /** Coupled context that governed this conversion. */
  context: GeminiRegionalContext;
  unitSystem: UnitSystem;
  /** "pure" = deterministic math; "gemini" reserved for future AI labeling assist. */
  mode: "pure" | "gemini" | "pending";
}
