/**
 * Conditional blueprint translation:
 *  1. Analyze PDF text layer (no OCR on upload)
 *  2. Native/selectable text → Cloud Document Translation (layout PDF)
 *  3. Scanned / image-only → Vision OCR → Cloud Translation text API
 */

import "server-only";

import { analyzePdfTextLayer } from "@/lib/pdf/text-layer";
import {
  isDocumentTranslationReady,
  translateDocumentPdf,
} from "@/lib/google-cloud/document-translation";
import { isVisionOcrReady, ocrPdfDocument } from "@/lib/google-cloud/vision-ocr";
import {
  isTextTranslationReady,
  translatePlainText,
} from "@/lib/google-cloud/text-translation";

export type ConditionalTranslateMode =
  | "document-translation"
  | "ocr-text-translation";

export interface ConditionalPdfTranslationInput {
  bytes: Buffer;
  filename?: string;
  targetLanguageCode: string;
  sourceLanguageCode?: string;
  /** Force OCR path (skip text-layer heuristic). */
  forceOcr?: boolean;
}

export interface ConditionalPdfTranslationResult {
  mode: ConditionalTranslateMode;
  hasSelectableText: boolean;
  textLayer: {
    pageCount: number;
    charCount: number;
    avgCharsPerPage: number;
    imageOnlyPageCount: number;
  };
  /** Translated PDF bytes (document path) or markdown/text bytes (OCR path). */
  bytes: Buffer;
  mimeType: string;
  /** Suggested output extension without leading dot. */
  outputExtension: "pdf" | "md";
  model?: string;
  detectedLanguageCode?: string;
  /** OCR source text (OCR path only). */
  ocrText?: string;
  /** Translated plain text (OCR path only). */
  translatedText?: string;
  provider: "google-cloud" | "google-cloud-ocr-text";
}

export function isConditionalPdfTranslationReady(): boolean {
  return isDocumentTranslationReady() || (isVisionOcrReady() && isTextTranslationReady());
}

/**
 * Translate a blueprint PDF with conditional OCR for scanned files.
 */
export async function translatePdfConditional(
  input: ConditionalPdfTranslationInput,
): Promise<ConditionalPdfTranslationResult> {
  if (!input.bytes?.length) {
    throw new Error("translatePdfConditional: empty PDF bytes");
  }

  const textLayer = await analyzePdfTextLayer(input.bytes);
  const useOcr = Boolean(input.forceOcr) || !textLayer.hasSelectableText;

  console.info("[conditional-pdf-translation] analysis", {
    file: input.filename,
    hasSelectableText: textLayer.hasSelectableText,
    pageCount: textLayer.pageCount,
    charCount: textLayer.charCount,
    avgCharsPerPage: textLayer.avgCharsPerPage,
    route: useOcr ? "ocr-text-translation" : "document-translation",
  });

  const layerMeta = {
    pageCount: textLayer.pageCount,
    charCount: textLayer.charCount,
    avgCharsPerPage: textLayer.avgCharsPerPage,
    imageOnlyPageCount: textLayer.imageOnlyPageCount,
  };

  if (!useOcr) {
    if (!isDocumentTranslationReady()) {
      throw new Error("Document Translation not configured for native PDF path");
    }
    try {
      const doc = await translateDocumentPdf({
        bytes: input.bytes,
        targetLanguageCode: input.targetLanguageCode,
        sourceLanguageCode: input.sourceLanguageCode,
        nativePdfOnly: true,
      });
      return {
        mode: "document-translation",
        hasSelectableText: true,
        textLayer: layerMeta,
        bytes: doc.bytes,
        mimeType: doc.mimeType || "application/pdf",
        outputExtension: "pdf",
        model: doc.model,
        detectedLanguageCode: doc.detectedLanguageCode,
        provider: "google-cloud",
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        "[conditional-pdf-translation] Document Translation failed — falling back to OCR",
        message,
      );
      // Fall through to OCR when native path fails (e.g. image-heavy "native" PDF).
    }
  }

  return runOcrTextTranslation(input, layerMeta, textLayer.hasSelectableText);
}

async function runOcrTextTranslation(
  input: ConditionalPdfTranslationInput,
  layerMeta: ConditionalPdfTranslationResult["textLayer"],
  hasSelectableText: boolean,
): Promise<ConditionalPdfTranslationResult> {
  if (!isVisionOcrReady()) {
    throw new Error(
      "PDF needs OCR (no usable text layer / Document Translation failed), but Vision OCR is not enabled/configured",
    );
  }
  if (!isTextTranslationReady()) {
    throw new Error("Cloud Translation credentials required for OCR text path");
  }

  const ocr = await ocrPdfDocument(input.bytes);
  if (!ocr.fullText.trim()) {
    throw new Error("Vision OCR returned no text from scanned PDF");
  }

  const translated = await translatePlainText({
    text: ocr.fullText,
    targetLanguageCode: input.targetLanguageCode,
    sourceLanguageCode: input.sourceLanguageCode,
  });

  const markdown = [
    `# Translated blueprint (OCR path)`,
    "",
    `Source file: ${input.filename || "blueprint.pdf"}`,
    `Pages: ${ocr.pageCount}`,
    `Target language: ${input.targetLanguageCode}`,
    `Pipeline: Google Cloud Vision OCR → Cloud Translation (text)`,
    "",
    "---",
    "",
    translated.translatedText.trim(),
    "",
  ].join("\n");

  const bytes = Buffer.from(markdown, "utf8");

  return {
    mode: "ocr-text-translation",
    hasSelectableText,
    textLayer: layerMeta,
    bytes,
    mimeType: "text/markdown; charset=utf-8",
    outputExtension: "md",
    model: translated.model,
    detectedLanguageCode: translated.detectedLanguageCode,
    ocrText: ocr.fullText,
    translatedText: translated.translatedText,
    provider: "google-cloud-ocr-text",
  };
}
