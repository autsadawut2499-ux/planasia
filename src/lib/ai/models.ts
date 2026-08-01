/**
 * Gemini model IDs — single source of truth.
 * Override via GEMINI_TEXT_MODEL / GEMINI_IMAGE_MODEL in .env.local.
 *
 * Default text model for new Google AI Studio keys (legacy gemini-2.x / some
 * 2.5 IDs return 404 for new users; Gemma often ignores JSON mime type).
 * Re-check with scripts/test-gemini.mjs if needed.
 */
export const DEFAULT_GEMINI_TEXT_MODEL = "gemini-3.5-flash-lite";
/** Image model verified via scripts/test-gemini-image.mjs (legacy 2.0 preview returns 404). */
export const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

export function getGeminiTextModel(): string {
  return process.env.GEMINI_TEXT_MODEL?.trim() || DEFAULT_GEMINI_TEXT_MODEL;
}

export function getGeminiImageModel(): string {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || DEFAULT_GEMINI_IMAGE_MODEL;
}
