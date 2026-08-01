/**
 * Full construction-blueprint PDF → Gemini multimodal translation.
 */

import "server-only";

import { getGeminiTextModel } from "@/lib/ai/models";
import { getGeminiClient } from "@/lib/gemini/client";
import { hasGeminiApiKey, isGeminiFeatureEnabled } from "@/lib/gemini/config";
import { createGeminiRegionalContext } from "@/lib/gemini/core-config";
import {
  deleteGeminiFile,
  shouldUseInlinePdf,
  uploadPdfToGeminiFiles,
  assertPdfSizeOk,
} from "@/lib/gemini/files";
import {
  buildBlueprintTranslationSystemInstruction,
  buildBlueprintTranslationUserMessage,
} from "@/lib/gemini/prompts/blueprint-translate";
import type { GeminiMarketCountryCode } from "@/lib/gemini/regional-units";

/** Multimodal parts accepted by @google/generative-ai generateContent. */
type ContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }
  | { fileData: { mimeType: string; fileUri: string } };

export interface BlueprintPdfInput {
  bytes: Buffer;
  filename: string;
  contentType?: string;
}

export interface BlueprintPdfTranslationResult {
  filename: string;
  sourceBytes: number;
  markdown: string;
  provider: "gemini" | "passthrough";
  /** UTF-8 markdown package ready to attach to email. */
  markdownBase64: string;
  error?: string;
}

export function isBlueprintPdfTranslationReady(): boolean {
  return isGeminiFeatureEnabled() && hasGeminiApiKey();
}

/**
 * Translate one construction blueprint PDF with Gemini (File API or inline).
 */
export async function translateBlueprintPdf(opts: {
  pdf: BlueprintPdfInput;
  planId: string;
  listingName?: string;
  target_country: GeminiMarketCountryCode | string;
  targetLanguageName: string;
}): Promise<BlueprintPdfTranslationResult> {
  const filename = opts.pdf.filename || `${opts.planId}.pdf`;
  assertPdfSizeOk(opts.pdf.bytes.length);

  if (!isBlueprintPdfTranslationReady()) {
    const stub = [
      `# ${opts.planId} — translation unavailable`,
      "",
      "Gemini is not configured. Original blueprint PDF was not translated.",
      `Source file: ${filename}`,
    ].join("\n");
    return {
      filename,
      sourceBytes: opts.pdf.bytes.length,
      markdown: stub,
      provider: "passthrough",
      markdownBase64: Buffer.from(stub, "utf8").toString("base64"),
      error: "Gemini not configured",
    };
  }

  const client = getGeminiClient();
  if (!client) {
    throw new Error("Gemini client unavailable");
  }

  const regional = createGeminiRegionalContext(opts.target_country);
  const systemInstruction = buildBlueprintTranslationSystemInstruction({
    targetLanguageName: opts.targetLanguageName,
    regional,
  });
  const userText = buildBlueprintTranslationUserMessage({
    planId: opts.planId,
    sourceFilename: filename,
    targetLanguageName: opts.targetLanguageName,
    regional,
    listingName: opts.listingName,
  });

  const model = client.getGenerativeModel({
    model: getGeminiTextModel(),
    systemInstruction,
  });

  let uploadedName: string | undefined;
  try {
    const parts: ContentPart[] = [];

    if (shouldUseInlinePdf(opts.pdf.bytes.length)) {
      parts.push({
        inlineData: {
          mimeType: "application/pdf",
          data: opts.pdf.bytes.toString("base64"),
        },
      });
    } else {
      const file = await uploadPdfToGeminiFiles({
        bytes: opts.pdf.bytes,
        displayName: filename,
      });
      uploadedName = file.name;
      parts.push({
        fileData: {
          mimeType: file.mimeType || "application/pdf",
          fileUri: file.uri,
        },
      });
    }

    parts.push({ text: userText });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: parts as never }],
    });

    const markdown = (result.response.text() || "").trim();
    if (!markdown) {
      throw new Error("Gemini returned empty blueprint translation");
    }

    return {
      filename,
      sourceBytes: opts.pdf.bytes.length,
      markdown,
      provider: "gemini",
      markdownBase64: Buffer.from(markdown, "utf8").toString("base64"),
    };
  } finally {
    await deleteGeminiFile(uploadedName);
  }
}
