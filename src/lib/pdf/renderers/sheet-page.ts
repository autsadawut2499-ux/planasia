import type { PDFDocument, PDFFont } from "pdf-lib";
import type { DrawingIndexEntry, HousePlanDocument } from "@/lib/plans/schema";
import type { UnitFormatOptions } from "@/lib/units/format";
import { VectorContext } from "@/lib/pdf/vector/context";
import { drawTitleBlock, type DrawContext } from "@/lib/pdf/sheet-renderers";
import { A3_LANDSCAPE, contentArea } from "@/lib/pdf/vector/layout";

/** Add an A3 landscape sheet with DPT title block and return vector context. */
export async function addVectorSheet(
  pdf: PDFDocument,
  font: PDFFont,
  fontBold: PDFFont,
  doc: HousePlanDocument,
  entry: DrawingIndexEntry,
  unitOpts: UnitFormatOptions,
  draw: (ctx: VectorContext, area: ReturnType<typeof contentArea>) => void,
): Promise<void> {
  const page = pdf.addPage([A3_LANDSCAPE.width, A3_LANDSCAPE.height]);
  const legacyCtx: DrawContext = {
    page,
    font,
    fontBold,
    doc,
    entry,
    sheetNo: entry.sheetNo,
    title: entry.title,
    titleTh: entry.titleTh,
    scale: entry.scale,
    unitOpts,
  };
  drawTitleBlock(legacyCtx);

  const vectorCtx = new VectorContext(
    page,
    font,
    fontBold,
    doc,
    entry.sheetNo,
    entry.title,
    entry.titleTh,
    entry.scale,
    unitOpts,
  );
  draw(vectorCtx, contentArea());
}

export { contentArea };
