import { GoogleGenerativeAI } from "@google/generative-ai";
import { getGeminiImageModel, getGeminiTextModel } from "./models";

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
    model: getGeminiTextModel(),
    generationConfig: { responseMimeType: "application/json" },
  });
}

export function getChatModel() {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({
    model: getGeminiTextModel(),
  });
}

export function getImageModel(systemInstruction?: string) {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({
    model: getGeminiImageModel(),
    ...(systemInstruction ? { systemInstruction } : {}),
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    } as Record<string, unknown>,
  });
}
