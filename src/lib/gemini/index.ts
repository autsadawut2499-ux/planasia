/**
 * Planasia ↔ Google Gemini integration surface.
 *
 * Use this barrel for new work. Low-level SDK helpers remain in `@/lib/ai/*`.
 * Capability implementations are intentionally incomplete until the next instruction.
 *
 * Core rule: always pass `GeminiRegionalContext` —
 * `{ target_country, unit_conversion_rule }` — as one coupled payload.
 */

export {
  getGeminiEnvSummary,
  hasGeminiApiKey,
  isGeminiFeatureEnabled,
} from "@/lib/gemini/config";

export {
  getChatModel,
  getGeminiClient,
  getImageModel,
  getTextModel,
  isGeminiConfigured,
} from "@/lib/gemini/client";

export {
  assertGeminiReady,
  describeGeminiReadiness,
  getGeminiSystemStatus,
} from "@/lib/gemini/readiness";

export {
  createGeminiExecutionContext,
  createGeminiRegionalContext,
  displayUnitSystemOf,
  isGeminiRegionalContext,
  listGeminiRegionalContexts,
  unitRuleFromProfile,
  unitRuleFromSystem,
} from "@/lib/gemini/core-config";

export type {
  GeminiExecutionContext,
  GeminiRegionalContext,
  TargetCountryCode,
  UnitConversionRule,
  UnitConversionRuleId,
} from "@/lib/gemini/core-config";

export {
  GEMINI_COUNTRY_UNIT_MAP,
  GEMINI_MARKET_COUNTRY_CODES,
  getCountryUnitProfile,
  isGeminiMarketCountryCode,
  isImperialUnitList,
  listGeminiMarketCountryOptions,
  resolveGeminiMarketCountry,
} from "@/lib/gemini/regional-units";

export type {
  CountryUnitProfile,
  GeminiMarketCountryCode,
  GeminiMarketCountryOption,
  MarketUnitLabel,
} from "@/lib/gemini/regional-units";

export type {
  GeminiCapability,
  GeminiSystemStatus,
  GeminiTranslateRequest,
  GeminiTranslateResult,
  GeminiUnitConvertRequest,
  GeminiUnitConvertResult,
} from "@/lib/gemini/types";

export {
  convertUnitsWithGeminiCapability,
  isGeminiTranslationReady,
  isUnitConversionReady,
  previewGeminiTranslationChunks,
  runGeminiTranslationWorkflow,
  sendGeminiTranslationPayload,
  translateWithGeminiCapability,
} from "@/lib/gemini/capabilities";

export {
  TRANSLATE_AND_CONVERT_UNITS_INSTRUCTION,
  buildGeminiTranslationPayload,
  buildGeminiTranslationPayloadBatch,
  buildTranslationSystemInstruction,
  buildTranslationUserMessage,
  expectedTranslationCount,
} from "@/lib/gemini/payloads/translation-request";

export type {
  BuildGeminiTranslationPayloadInput,
  GeminiTranslationApiPayload,
  GeminiTranslationContent,
} from "@/lib/gemini/payloads/translation-request";

export {
  DEFAULT_CHUNKING,
  buildTranslationChunks,
  packPagesIntoChunks,
  packTextsIntoChunks,
  resolveChunkingOptions,
  splitDocumentIntoPages,
} from "@/lib/gemini/payloads/chunking";

export type {
  ChunkMode,
  ContentChunk,
  DocumentPage,
  TranslationChunkingOptions,
} from "@/lib/gemini/payloads/chunking";

export type {
  GeminiTranslateChunkingRequest,
  GeminiTranslationPaginationMeta,
} from "@/lib/gemini/types";

export {
  buildRegionalUnitDocument,
  buildTranslateWithUnitsPrompt,
} from "@/lib/gemini/prompts/translate-with-units";

export {
  orderNeedsPostPaymentTranslation,
  runPostPaymentTranslation,
} from "@/lib/gemini/post-payment-translation";

export type {
  PostPaymentTranslationResult,
  TranslatedBlueprintFile,
  TranslationJobStatus,
} from "@/lib/gemini/post-payment-translation";

export {
  isBlueprintPdfTranslationReady,
  translateBlueprintPdf,
} from "@/lib/gemini/capabilities/blueprint-pdf-translation";

export type { BlueprintPdfTranslationResult } from "@/lib/gemini/capabilities/blueprint-pdf-translation";

export {
  heuristicPlanIntent,
  isPlanChatReady,
  runPlanFinderChat,
} from "@/lib/gemini/capabilities/plan-chat";

export type {
  PlanChatHistoryTurn,
  PlanChatListingCard,
  PlanChatResult,
} from "@/lib/gemini/capabilities/plan-chat";

/** Cloud Document Translation (production post-payment engine). */
export {
  isDocumentTranslationReady,
  translateDocumentPdf,
  toCloudTranslateLanguageCode,
} from "@/lib/google-cloud/document-translation";

export {
  isConditionalPdfTranslationReady,
  translatePdfConditional,
} from "@/lib/google-cloud/conditional-pdf-translation";

export { analyzePdfTextLayer } from "@/lib/pdf/text-layer";
