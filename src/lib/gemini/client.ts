/**
 * Connection entry for Google Gemini.
 * Reuses the existing SDK wrapper; do not duplicate key handling here.
 */

export {
  getChatModel,
  getGeminiClient,
  getImageModel,
  getTextModel,
  isGeminiConfigured,
} from "@/lib/ai/gemini";
