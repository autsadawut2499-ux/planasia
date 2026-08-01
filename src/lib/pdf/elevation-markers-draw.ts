import type { PDFPage, PDFFont } from "pdf-lib";
import { rgb } from "pdf-lib";
import {
  ELEVATION_DIRECTIONS,
  ELEVATION_PLACEHOLDER_FOOTNOTE_EN,
  ELEVATION_PLACEHOLDER_FOOTNOTE_TH,
  elevationMarkerAnchors,
  roomBoundsFromPlan,
} from "@/lib/plans/elevation-markers";
import type { PlanRoom } from "@/lib/plans/schema";

export interface FloorPlanTransform {
  originX: number;
  originY: number;
  scale: number;
  maxY: number;
}

export function floorPlanTransform(
  rooms: PlanRoom[],
  area: { x: number; y: number; width: number; height: number },
): FloorPlanTransform | null {
  if (!rooms.length) return null;
  const maxX = Math.max(...rooms.map((r) => r.x + r.width), 1);
  const maxY = Math.max(...rooms.map((r) => r.y + r.depth), 1);
  const scale = Math.min(area.width / maxX, area.height / maxY) * 0.85;
  return { originX: area.x, originY: area.y, scale, maxY };
}

function planToPage(t: FloorPlanTransform, planX: number, planY: number): { x: number; y: number } {
  return {
    x: t.originX + planX * t.scale,
    y: t.originY + (t.maxY - planY) * t.scale,
  };
}

/** Stamp 4 standard elevation view markers (circles) on a floor plan sheet. */
export function drawElevationMarkersPdf(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  rooms: PlanRoom[],
  transform: FloorPlanTransform,
) {
  const bounds = roomBoundsFromPlan(rooms);
  const anchors = elevationMarkerAnchors(bounds);
  const radius = Math.max(10, Math.min(16, transform.scale * 0.55));

  for (const dir of ELEVATION_DIRECTIONS) {
    const anchor = anchors[dir.id];
    const { x, y } = planToPage(transform, anchor.x, anchor.y);

    page.drawCircle({
      x,
      y,
      size: radius,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1.2,
    });

    page.drawLine({
      start: { x: x - radius * 0.35, y: y + radius * 0.1 },
      end: { x: x + radius * 0.35, y: y + radius * 0.1 },
      thickness: 0.8,
      color: rgb(0, 0, 0),
    });

    const codeWidth = fontBold.widthOfTextAtSize(dir.code, 10);
    page.drawText(dir.code, {
      x: x - codeWidth / 2,
      y: y - 4,
      size: 10,
      font: fontBold,
    });

    const noteSize = 6.5;
    const noteWidth = font.widthOfTextAtSize(dir.floorPlanNoteTh, noteSize);
    let noteX = x - noteWidth / 2;
    let noteY = y - radius - 10;

    if (dir.id === "north") noteY = y + radius + 12;
    if (dir.id === "south") noteY = y - radius - 14;
    if (dir.id === "east") {
      noteX = x + radius + 4;
      noteY = y - 3;
    }
    if (dir.id === "west") {
      noteX = x - radius - noteWidth - 4;
      noteY = y - 3;
    }

    page.drawText(dir.floorPlanNoteTh, {
      x: noteX,
      y: noteY,
      size: noteSize,
      font,
      color: rgb(0.25, 0.25, 0.25),
    });
  }
}

function drawElevationPlaceholderPanelPdf(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  x: number,
  y: number,
  width: number,
  height: number,
  titleTh: string,
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    borderColor: rgb(0.55, 0.55, 0.55),
    borderWidth: 1,
    color: rgb(0.96, 0.96, 0.96),
  });

  page.drawLine({
    start: { x: x + width * 0.12, y: y + height * 0.38 },
    end: { x: x + width * 0.5, y: y + height * 0.72 },
    thickness: 1,
    color: rgb(0.35, 0.35, 0.35),
  });
  page.drawLine({
    start: { x: x + width * 0.5, y: y + height * 0.72 },
    end: { x: x + width * 0.88, y: y + height * 0.38 },
    thickness: 1,
    color: rgb(0.35, 0.35, 0.35),
  });
  page.drawRectangle({
    x: x + width * 0.12,
    y,
    width: width * 0.76,
    height: height * 0.38,
    borderColor: rgb(0.35, 0.35, 0.35),
    borderWidth: 1,
  });
  page.drawRectangle({
    x: x + width * 0.42,
    y: y + height * 0.1,
    width: width * 0.16,
    height: height * 0.18,
    borderColor: rgb(0.35, 0.35, 0.35),
    borderWidth: 0.8,
  });

  page.drawText("PLACEHOLDER", {
    x: x + width * 0.28,
    y: y + height * 0.82,
    size: 7,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  const titleSize = 8;
  page.drawText(titleTh, {
    x: x + 6,
    y: y - 12,
    size: titleSize,
    font: fontBold,
  });
}

/** A4.00 — fixed placeholder elevation panels (no dynamic AI views). */
export function drawElevationPlaceholderSheetPdf(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  area: { x: number; y: number; width: number; height: number },
) {
  const cols = 2;
  const rows = 2;
  const gap = 24;
  const panelW = (area.width - gap) / cols;
  const panelH = (area.height - gap - 40) / rows;
  const startY = area.y + area.height - panelH;

  ELEVATION_DIRECTIONS.forEach((dir, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const px = area.x + col * (panelW + gap);
    const py = startY - row * (panelH + gap);

    page.drawText(`${dir.code} — ${dir.labelTh} (${dir.labelEn})`, {
      x: px,
      y: py + panelH + 6,
      size: 9,
      font: fontBold,
    });

    drawElevationPlaceholderPanelPdf(page, font, fontBold, px, py, panelW, panelH, dir.placeholderTitleTh);
  });

  page.drawText(ELEVATION_PLACEHOLDER_FOOTNOTE_TH, {
    x: area.x,
    y: area.y + 8,
    size: 7,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(ELEVATION_PLACEHOLDER_FOOTNOTE_EN, {
    x: area.x,
    y: area.y - 4,
    size: 6.5,
    font,
    color: rgb(0.55, 0.55, 0.55),
  });
}
