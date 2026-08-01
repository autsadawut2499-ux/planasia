import type { PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import type { DrawingIndexEntry, HousePlanDocument, PlanRoom } from "@/lib/plans/schema";
import { drawTitleBlockFromTemplate } from "@/lib/pdf/title-block";
import type { UnitFormatOptions } from "@/lib/units/format";
import { formatArea, formatRoomSize, PDF_LABEL_SIZE, PDF_NOTE_SIZE } from "@/lib/units/format";
import { rgb } from "pdf-lib";
import { A3_LANDSCAPE, MARGIN, TITLE_BLOCK_H, contentArea as layoutContentArea } from "@/lib/pdf/vector/layout";
import { resolveRenderer } from "@/lib/pdf/renderers";

export { A3_LANDSCAPE, MARGIN, TITLE_BLOCK_H };
export const contentArea = layoutContentArea;

export interface DrawContext {
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  doc: HousePlanDocument;
  entry: DrawingIndexEntry;
  sheetNo: string;
  title: string;
  titleTh: string;
  scale: string;
  unitOpts: UnitFormatOptions;
}

export function drawTitleBlock(ctx: DrawContext) {
  drawTitleBlockFromTemplate(ctx.page, ctx.font, ctx.fontBold, ctx.doc, ctx.entry);
}

export function drawTextLines(
  page: PDFPage,
  font: PDFFont,
  lines: string[],
  x: number,
  y: number,
  size = 9,
  lineHeight = 14,
) {
  lines.forEach((line, i) => {
    page.drawText(line, { x, y: y - i * lineHeight, size, font });
  });
}

export function drawFloorPlan(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  rooms: PlanRoom[],
  area: { x: number; y: number; width: number; height: number },
  scaleLabel: string,
  unitOpts: UnitFormatOptions,
) {
  if (!rooms.length) {
    drawTextLines(page, font, ["No room data — edit layout in workspace."], area.x, area.y + area.height, 9, 14);
    return;
  }

  const maxX = Math.max(...rooms.map((r) => r.x + r.width), 1);
  const maxY = Math.max(...rooms.map((r) => r.y + r.depth), 1);
  const scale = Math.min(area.width / maxX, area.height / maxY) * 0.85;

  page.drawText(scaleLabel, { x: area.x, y: area.y + area.height + 8, size: PDF_NOTE_SIZE, font });

  for (const room of rooms) {
    const rx = area.x + room.x * scale;
    const ry = area.y + (maxY - room.y - room.depth) * scale;
    const rw = room.width * scale;
    const rh = room.depth * scale;

    page.drawRectangle({
      x: rx,
      y: ry,
      width: rw,
      height: rh,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });

    const label = `${room.name}\n${formatRoomSize(room.width, room.depth, unitOpts)}`;
    label.split("\n").forEach((line, i) => {
      page.drawText(line, {
        x: rx + 4,
        y: ry + rh / 2 - i * 10,
        size: PDF_LABEL_SIZE,
        font: i === 0 ? fontBold : font,
      });
    });
  }
}

export async function addSheet(
  pdf: PDFDocument,
  font: PDFFont,
  fontBold: PDFFont,
  doc: HousePlanDocument,
  entry: DrawingIndexEntry,
  unitOpts: UnitFormatOptions,
  render: (ctx: DrawContext, area: ReturnType<typeof contentArea>) => void,
) {
  const page = pdf.addPage([A3_LANDSCAPE.width, A3_LANDSCAPE.height]);
  const ctx: DrawContext = {
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
  drawTitleBlock(ctx);
  render(ctx, contentArea());
}

/** Render one indexed sheet via the DPT plugin renderer registry. */
export async function renderIndexedSheet(
  pdf: PDFDocument,
  font: PDFFont,
  fontBold: PDFFont,
  doc: HousePlanDocument,
  entry: DrawingIndexEntry,
  unitOpts: UnitFormatOptions,
): Promise<boolean> {
  if (entry.sheetNo === "TB") return false;
  const renderer = resolveRenderer(entry);
  if (!renderer) return false;
  return renderer.render({ pdf, font, fontBold, doc, entry, unitOpts });
}
