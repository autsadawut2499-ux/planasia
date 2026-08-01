import type { GeminiCapability, GeminiSystemStatus } from "@/lib/gemini/types";
import { getGeminiEnvSummary, hasGeminiApiKey, isGeminiFeatureEnabled } from "@/lib/gemini/config";
import { getGeminiImageModel, getGeminiTextModel } from "@/lib/ai/models";

/**
 * Single readiness probe for admin / health / UI “AI Live” wiring.
 */
export function getGeminiSystemStatus(): GeminiSystemStatus {
  const enabled = isGeminiFeatureEnabled() && hasGeminiApiKey();
  const configured = hasGeminiApiKey();

  const capabilities: Record<GeminiCapability, boolean> = {
    text: enabled,
    image: enabled,
    // Translate + strict unit conversion requires Gemini (prompt embeds regional config).
    translation: enabled,
    // Deterministic unit math is always available; Gemini assist uses the same context.
    unitConversion: true,
  };

  return {
    enabled,
    configured,
    textModel: getGeminiTextModel(),
    imageModel: getGeminiImageModel(),
    capabilities,
  };
}

export function assertGeminiReady(capability: GeminiCapability = "text"): void {
  const status = getGeminiSystemStatus();
  if (!status.capabilities[capability]) {
    throw new Error(
      `[gemini] capability "${capability}" is not ready — set GEMINI_API_KEY and ensure GEMINI_ENABLED is not false`,
    );
  }
}

/** Debug helper — do not expose secrets. */
export function describeGeminiReadiness(): Record<string, unknown> {
  return {
    ...getGeminiEnvSummary(),
    status: getGeminiSystemStatus(),
  };
}
