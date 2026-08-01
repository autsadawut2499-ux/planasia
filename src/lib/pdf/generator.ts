import type { HousePlanDocument } from "@/lib/plans/schema";
import type { RenderSetOptions } from "@/lib/pdf/types";
import { renderDrawingSet } from "@/lib/pdf/pipeline";
import { validateDrawingSet } from "@/lib/pdf/validator";
import { vectorStatusSummary } from "@/lib/pdf/sheet-registry";

export interface PdfExportOptions extends RenderSetOptions {}

/** Generate a complete multi-sheet A3 vector PDF permit drawing set (DPT Golden Standard). */
export async function generatePlanPdf(
  doc: HousePlanDocument,
  options: PdfExportOptions = {},
): Promise<Uint8Array> {
  const result = await renderDrawingSet(doc, options);
  return result.bytes;
}

export function pdfSheetCount(doc: HousePlanDocument): number {
  return doc.index.filter((e) => e.sheetNo !== "TB").length;
}

export { validateDrawingSet, vectorStatusSummary, renderDrawingSet };
