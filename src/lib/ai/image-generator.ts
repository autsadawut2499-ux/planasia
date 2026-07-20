import type { ProjectInput } from "@/lib/ai/types";
import { getImageModel, isGeminiConfigured } from "./gemini";

const FALLBACK_PERSPECTIVE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85";
const FALLBACK_FLOOR1 =
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80";
const FALLBACK_FLOOR2 =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80";

function buildPerspectivePrompt(project: ProjectInput): string {
  return `Photorealistic architectural exterior render of a ${project.style} ${project.floors}-storey residential house in ${project.location || "Southeast Asia"}.
${project.bedrooms} bedrooms, ${project.bathrooms} bathrooms, ${project.roofType} roof, ${project.colorPalette} color palette.
${project.wallMaterial} walls, modern tropical context, golden hour lighting, professional architectural visualization.`;
}

function buildFloorPlanPrompt(project: ProjectInput, floor: number): string {
  return `Clean architectural floor plan drawing, black lines on white, ${project.style} house floor ${floor}, ${project.bedrooms} bedrooms layout, technical drawing style, top-down view, labeled rooms, 1:100 scale appearance.`;
}

async function extractImageFromResponse(response: { candidates?: { content?: { parts?: { inlineData?: { mimeType: string; data: string }; text?: string }[] } }[] }): Promise<string | null> {
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
  if (!isGeminiConfigured()) return FALLBACK_PERSPECTIVE;

  const model = getImageModel();
  if (!model) return FALLBACK_PERSPECTIVE;

  try {
    const result = await model.generateContent(buildPerspectivePrompt(project));
    const img = await extractImageFromResponse(result.response as never);
    return img ?? FALLBACK_PERSPECTIVE;
  } catch {
    return FALLBACK_PERSPECTIVE;
  }
}

export async function generateFloorPlanImages(project: ProjectInput): Promise<string[]> {
  if (!isGeminiConfigured()) {
    return project.floors === 2 ? [FALLBACK_FLOOR1, FALLBACK_FLOOR2] : [FALLBACK_FLOOR1];
  }

  const model = getImageModel();
  if (!model) {
    return project.floors === 2 ? [FALLBACK_FLOOR1, FALLBACK_FLOOR2] : [FALLBACK_FLOOR1];
  }

  const urls: string[] = [];
  const floors = project.floors === 2 ? [1, 2] : [1];

  for (const floor of floors) {
    try {
      const result = await model.generateContent(buildFloorPlanPrompt(project, floor));
      const img = await extractImageFromResponse(result.response as never);
      urls.push(img ?? (floor === 1 ? FALLBACK_FLOOR1 : FALLBACK_FLOOR2));
    } catch {
      urls.push(floor === 1 ? FALLBACK_FLOOR1 : FALLBACK_FLOOR2);
    }
  }

  return urls;
}
