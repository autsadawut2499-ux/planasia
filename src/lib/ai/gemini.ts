import { GoogleGenerativeAI } from "@google/generative-ai";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function getGeminiClient(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenerativeAI(key);
}

export function getTextModel() {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({
    model: process.env.GEMINI_TEXT_MODEL ?? "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
}

export function getChatModel() {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({
    model: process.env.GEMINI_TEXT_MODEL ?? "gemini-2.0-flash",
  });
}

export function getImageModel() {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({
    model: process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.0-flash-preview-image-generation",
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    } as Record<string, unknown>,
  });
}
