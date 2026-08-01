import { DPT_SHEET } from "@/lib/pdf/dpt-standards";
import { titleBlockHeightPt } from "@/lib/pdf/title-block/template-loader";
import type { Rect } from "@/lib/pdf/vector/primitives";

export const A3_LANDSCAPE = { width: DPT_SHEET.widthPt, height: DPT_SHEET.heightPt };
export const MARGIN = DPT_SHEET.marginPt;

/** Title block height from active template (Titan Box standard = 100pt). */
export function titleBlockHeight(): number {
  return titleBlockHeightPt();
}

export { titleBlockHeightPt as TITLE_BLOCK_H };

/** Printable content area above the title block. */
export function contentArea(): Rect {
  const tbH = titleBlockHeight();
  return {
    x: MARGIN + 10,
    y: MARGIN + tbH + 20,
    width: A3_LANDSCAPE.width - MARGIN * 2 - 20,
    height: A3_LANDSCAPE.height - MARGIN * 2 - tbH - 40,
  };
}

/** Fit model coordinates (meters) into a viewport rect. Y-up model → PDF Y-up. */
export function fitToArea(
  modelWidth: number,
  modelHeight: number,
  area: Rect,
  padding = 0.85,
): { scale: number; offsetX: number; offsetY: number; modelHeight: number } {
  const scale = Math.min(area.width / modelWidth, area.height / modelHeight) * padding;
  return {
    scale,
    offsetX: area.x,
    offsetY: area.y,
    modelHeight,
  };
}

export function modelToPage(
  mx: number,
  my: number,
  modelHeight: number,
  transform: { scale: number; offsetX: number; offsetY: number },
): { x: number; y: number } {
  return {
    x: transform.offsetX + mx * transform.scale,
    y: transform.offsetY + (modelHeight - my) * transform.scale,
  };
}

/** Split content area into a grid of panels (e.g. 2×2 elevations). */
export function gridPanels(area: Rect, cols: number, rows: number, gap = 8): Rect[] {
  const cellW = (area.width - gap * (cols - 1)) / cols;
  const cellH = (area.height - gap * (rows - 1)) / rows;
  const panels: Rect[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      panels.push({
        x: area.x + col * (cellW + gap),
        y: area.y + (rows - 1 - row) * (cellH + gap),
        width: cellW,
        height: cellH,
      });
    }
  }
  return panels;
}
