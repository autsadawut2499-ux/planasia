import type { ProjectInput } from "@/lib/ai/types";
import { getImageModel, isGeminiConfigured } from "./gemini";

function buildPerspectivePrompt(project: ProjectInput): string {
  return `Photorealistic architectural exterior 3D render of a ${project.style} ${project.floors}-storey residential house in ${project.location || "Southeast Asia"}.
${project.bedrooms} bedrooms, ${project.bathrooms} bathrooms, ${project.roofType} roof, ${project.colorPalette} color palette.
${project.wallMaterial} walls, modern tropical context, golden hour lighting, professional architectural visualization, slight perspective angle.`;
}

function buildFacadePrompt(project: ProjectInput): string {
  return `Photorealistic architectural front facade elevation of a ${project.style} ${project.floors}-storey residential house in ${project.location || "Southeast Asia"}.
${project.bedrooms} bedrooms, ${project.bathrooms} bathrooms, ${project.roofType} roof, ${project.colorPalette} color palette.
${project.wallMaterial} walls, perfectly straight-on front view, symmetrical composition, no perspective distortion, professional architectural photography style, clear sky background.`;
}

function buildFloorPlanPrompt(project: ProjectInput, floor: number): string {
  return `Beautiful clean architectural floor plan drawing, black lines on white background, ${project.style} house floor ${floor}, ${project.bedrooms} bedrooms layout, professional permit drawing style, top-down view, labeled rooms, furniture hints, 1:100 scale appearance, high contrast, publication quality.`;
}

async function extractImageFromResponse(response: {
  candidates?: { content?: { parts?: { inlineData?: { mimeType: string; data: string }; text?: string }[] } }[];
}): Promise<string | null> {
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      const mime = part.inlineData.mimeType || "image/png";
      return `data:${mime};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function generatePerspectiveImage(project: ProjectInput): Promise<string> {
  if (!isGeminiConfigured()) return "";

  const model = getImageModel();
  if (!model) return "";

  try {
    const result = await model.generateContent(buildPerspectivePrompt(project));
    const img = await extractImageFromResponse(result.response as never);
    return img ?? "";
  } catch {
    return "";
  }
}

export async function generateFacadeImage(project: ProjectInput): Promise<string> {
  if (!isGeminiConfigured()) return "";

  const model = getImageModel();
  if (!model) return "";

  try {
    const result = await model.generateContent(buildFacadePrompt(project));
    const img = await extractImageFromResponse(result.response as never);
    return img ?? "";
  } catch {
    return "";
  }
}

export async function generateFloorPlanImages(project: ProjectInput): Promise<string[]> {
  if (!isGeminiConfigured()) return [];

  const model = getImageModel();
  if (!model) return [];

  const urls: string[] = [];
  const floors = project.floors === 2 ? [1, 2] : [1];

  for (const floor of floors) {
    try {
      const result = await model.generateContent(buildFloorPlanPrompt(project, floor));
      const img = await extractImageFromResponse(result.response as never);
      if (img) urls.push(img);
    } catch {
      /* skip failed floor */
    }
  }

  return urls;
}
