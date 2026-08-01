/**
 * Gemini connection configuration — env + feature flags only.
 * Implementation of calls lives under capabilities/ (next instruction).
 */

import { getGeminiImageModel, getGeminiTextModel } from "@/lib/ai/models";

/** Master switch. Defaults ON when a key exists; set GEMINI_ENABLED=false to force off. */
export function isGeminiFeatureEnabled(): boolean {
  const flag = process.env.GEMINI_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "off") return false;
  if (flag === "true" || flag === "1" || flag === "on") return true;
  // Auto-enable when a key is present.
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function hasGeminiApiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function getGeminiEnvSummary() {
  return {
    enabled: isGeminiFeatureEnabled(),
    configured: hasGeminiApiKey(),
    textModel: getGeminiTextModel(),
    imageModel: getGeminiImageModel(),
    translateFallbackGoogle: Boolean(process.env.GOOGLE_TRANSLATE_API_KEY?.trim()),
  };
}
