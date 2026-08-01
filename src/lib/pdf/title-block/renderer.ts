import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";
import type { DrawingIndexEntry, HousePlanDocument } from "@/lib/plans/schema";
import { A3_LANDSCAPE, MARGIN } from "@/lib/pdf/vector/layout";
import { getTitleBlockTemplate } from "@/lib/pdf/title-block/template-loader";
import { resolveTitleBlockFields } from "@/lib/pdf/title-block/fields";
import type { TitleBlockFieldKey, TitleBlockGeometry, TitleBlockTemplate } from "@/lib/pdf/title-block/schema";

function ink(hex?: string) {
  if (!hex || hex === "#000000" || hex === "#111") return rgb(0, 0, 0);
  if (hex === "#666666") return rgb(0.4, 0.4, 0.4);
  return rgb(0, 0, 0);
}

function drawGeometry(page: PDFPage, geom: TitleBlockGeometry, ox: number, oy: number, w: number, h: number) {
  if (geom.type === "rect") {
    page.drawRectangle({
      x: ox + geom.x * w,
      y: oy + geom.y * h,
      width: geom.w * w,
      height: geom.h * h,
      borderColor: rgb(0, 0, 0),
      borderWidth: geom.strokeWidth ?? 1,
    });
    return;
  }
  page.drawLine({
    start: { x: ox + geom.x1 * w, y: oy + geom.y1 * h },
    end: { x: ox + geom.x2 * w, y: oy + geom.y2 * h },
    thickness: geom.strokeWidth ?? 0.5,
    color: rgb(0, 0, 0),
  });
}

/** Render the standard DPT title block on a PDF page (pure vector). */
export function drawTitleBlockFromTemplate(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  doc: HousePlanDocument,
  entry: DrawingIndexEntry,
  template: TitleBlockTemplate = getTitleBlockTemplate(),
): void {
  const tbW = A3_LANDSCAPE.width - MARGIN * 2;
  const tbH = template.heightPt;
  const tbX = MARGIN;
  const tbY = MARGIN;

  for (const geom of template.geometry) {
    drawGeometry(page, geom, tbX, tbY, tbW, tbH);
  }

  for (const label of template.labels ?? []) {
    page.drawText(label.text, {
      x: tbX + label.x * tbW,
      y: tbY + label.y * tbH,
      size: label.fontSize,
      font: label.bold ? fontBold : font,
      color: rgb(0.35, 0.35, 0.35),
    });
  }

  const maxLengths = Object.fromEntries(
    template.fields.filter((f) => f.maxLength).map((f) => [f.key, f.maxLength!]),
  ) as Partial<Record<TitleBlockFieldKey, number>>;

  const values = resolveTitleBlockFields(doc, entry, maxLengths);

  for (const slot of template.fields) {
    const value = values[slot.key];
    if (!value) continue;
    page.drawText(value, {
      x: tbX + slot.x * tbW,
      y: tbY + slot.y * tbH,
      size: slot.fontSize,
      font: slot.bold ? fontBold : font,
      color: ink(slot.color),
    });
  }
}
