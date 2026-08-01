import type { PDFFont, PDFPage } from "pdf-lib";
import type { HousePlanDocument } from "@/lib/plans/schema";
import type { UnitFormatOptions } from "@/lib/units/format";
import type { Rect } from "@/lib/pdf/vector/primitives";
import * as v from "@/lib/pdf/vector/primitives";

/** Vector drawing context for a single sheet — wraps pdf-lib page + fonts. */
export class VectorContext {
  constructor(
    readonly page: PDFPage,
    readonly font: PDFFont,
    readonly fontBold: PDFFont,
    readonly doc: HousePlanDocument,
    readonly sheetNo: string,
    readonly title: string,
    readonly titleTh: string,
    readonly scale: string,
    readonly unitOpts: UnitFormatOptions,
  ) {}

  strokeRect(rect: Rect, thickness?: number) {
    v.strokeRect(this.page, rect, thickness);
  }

  text(value: string, at: v.Point2, size = 9, bold = false) {
    v.text(this.page, value, at, bold ? this.fontBold : this.font, size, bold);
  }

  textBlock(lines: string[], origin: v.Point2, size = 9, lineHeight = 14) {
    v.textBlock(this.page, this.font, lines, origin, size, lineHeight);
  }

  line(from: v.Point2, to: v.Point2, thickness?: number) {
    v.line(this.page, from, to, thickness);
  }

  polyline(points: v.Point2[], closed?: boolean) {
    v.polyline(this.page, points, closed);
  }

  dimensionHorizontal(from: v.Point2, to: v.Point2, label: string) {
    v.dimensionHorizontal(this.page, this.font, from, to, label);
  }
}
