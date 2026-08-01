/**
 * Detect whether a PDF has a usable selectable text layer.
 * Upload stays OCR-free — this runs only when translation is requested.
 */

import "server-only";

import { extractText, getDocumentProxy } from "unpdf";

export interface PdfTextLayerAnalysis {
  pageCount: number;
  /** Total extracted characters (whitespace-collapsed). */
  charCount: number;
  /** Average chars per page. */
  avgCharsPerPage: number;
  /** True when enough embedded text exists for Document Translation. */
  hasSelectableText: boolean;
  /** Pages that look empty of text (likely image-only). */
  imageOnlyPageCount: number;
}

/**
 * CAD blueprints often have sparse selectable labels (not prose).
 * Any meaningful embedded text → prefer Document Translation.
 * Truly scanned PDFs usually extract ~0 characters.
 */
const MIN_TOTAL_CHARS = 30;
/** At least this many pages must contain a little text to count as a text layer. */
const MIN_PAGES_WITH_TEXT = 1;

/**
 * Analyze embedded text without OCR. Cheap local parse (pdf.js via unpdf).
 */
export async function analyzePdfTextLayer(
  pdfBytes: Buffer,
): Promise<PdfTextLayerAnalysis> {
  const data = new Uint8Array(pdfBytes);
  const pdf = await getDocumentProxy(data);
  const pageCount = Math.max(1, pdf.numPages || 1);

  const extracted = await extractText(pdf, { mergePages: false });
  const pages: string[] = Array.isArray(extracted.text)
    ? extracted.text.map((t) => String(t ?? ""))
    : [String(extracted.text ?? "")];

  let charCount = 0;
  let imageOnlyPageCount = 0;

  for (const page of pages) {
    const collapsed = page.replace(/\s+/g, " ").trim();
    const n = collapsed.length;
    charCount += n;
    if (n < 12) imageOnlyPageCount += 1;
  }

  // If extractText returned a single merged blob for multi-page, recount pages loosely.
  if (pages.length === 1 && pageCount > 1) {
    imageOnlyPageCount = charCount < MIN_TOTAL_CHARS ? pageCount : 0;
  }

  const avgCharsPerPage = charCount / pageCount;
  const pagesWithText = Math.max(0, pageCount - imageOnlyPageCount);
  const hasSelectableText =
    charCount >= MIN_TOTAL_CHARS && pagesWithText >= MIN_PAGES_WITH_TEXT;

  return {
    pageCount,
    charCount,
    avgCharsPerPage: Math.round(avgCharsPerPage * 10) / 10,
    hasSelectableText,
    imageOnlyPageCount,
  };
}
