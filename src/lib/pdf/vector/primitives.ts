/**
 * Pure vector drawing primitives — all output is pdf-lib paths/text (no raster).
 */
import type { PDFFont, PDFPage, RGB } from "pdf-lib";
import { rgb } from "pdf-lib";

export const INK = rgb(0, 0, 0);
export const INK_LIGHT = rgb(0.45, 0.45, 0.45);
export const INK_DIM = rgb(0.65, 0.65, 0.65);

export interface Point2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function strokeRect(page: PDFPage, rect: Rect, thickness = 1, color: RGB = INK) {
  page.drawRectangle({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    borderColor: color,
    borderWidth: thickness,
  });
}

export function fillRect(page: PDFPage, rect: Rect, color: RGB, border?: { width: number; color: RGB }) {
  page.drawRectangle({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    color,
    borderColor: border?.color,
    borderWidth: border?.width,
  });
}

export function line(
  page: PDFPage,
  from: Point2,
  to: Point2,
  thickness = 0.5,
  color: RGB = INK,
  dash?: number[],
) {
  page.drawLine({
    start: from,
    end: to,
    thickness,
    color,
    dashArray: dash,
    dashPhase: dash ? 0 : undefined,
  });
}

export function polyline(page: PDFPage, points: Point2[], closed = false, thickness = 0.5, color: RGB = INK) {
  for (let i = 0; i < points.length - 1; i++) {
    line(page, points[i]!, points[i + 1]!, thickness, color);
  }
  if (closed && points.length > 2) {
    line(page, points[points.length - 1]!, points[0]!, thickness, color);
  }
}

export function circle(
  page: PDFPage,
  center: Point2,
  radius: number,
  stroke = true,
  fill?: RGB,
  thickness = 0.5,
) {
  page.drawCircle({
    x: center.x,
    y: center.y,
    size: radius * 2,
    borderColor: stroke ? INK : undefined,
    borderWidth: stroke ? thickness : 0,
    color: fill,
  });
}

export function text(
  page: PDFPage,
  value: string,
  at: Point2,
  font: PDFFont,
  size: number,
  bold = false,
  color: RGB = INK,
) {
  page.drawText(value, { x: at.x, y: at.y, size, font, color });
}

export function textBlock(
  page: PDFPage,
  font: PDFFont,
  lines: string[],
  origin: Point2,
  size = 9,
  lineHeight = 14,
  color: RGB = INK,
) {
  lines.forEach((line, i) => {
    text(page, line, { x: origin.x, y: origin.y - i * lineHeight }, font, size, false, color);
  });
}

/** Simple horizontal dimension line with ticks (vector). */
export function dimensionHorizontal(
  page: PDFPage,
  font: PDFFont,
  from: Point2,
  to: Point2,
  label: string,
  offsetY = 12,
) {
  const y = Math.min(from.y, to.y) - offsetY;
  line(page, { x: from.x, y: from.y }, { x: from.x, y }, 0.35);
  line(page, { x: to.x, y: to.y }, { x: to.x, y }, 0.35);
  line(page, { x: from.x, y }, { x: to.x, y }, 0.35);
  line(page, { x: from.x, y: y - 3 }, { x: from.x, y: y + 3 }, 0.5);
  line(page, { x: to.x, y: y - 3 }, { x: to.x, y: y + 3 }, 0.5);
  const labelW = font.widthOfTextAtSize(label, 7);
  text(page, label, { x: (from.x + to.x) / 2 - labelW / 2, y: y - 10 }, font, 7);
}

/** Drawing border — standard DPT sheet frame. */
export function drawSheetBorder(page: PDFPage, margin: number, width: number, height: number) {
  strokeRect(page, { x: margin, y: margin, width: width - margin * 2, height: height - margin * 2 }, 1);
}
