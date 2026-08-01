import type { DrawingIndexEntry, HousePlanDocument } from "@/lib/plans/schema";
import { getTitleBlockTemplate } from "@/lib/pdf/title-block/template-loader";
import { resolveTitleBlockFields } from "@/lib/pdf/title-block/fields";
import type { TitleBlockFieldKey, TitleBlockGeometry, TitleBlockTemplate } from "@/lib/pdf/title-block/schema";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function svgGeometry(geom: TitleBlockGeometry, w: number, h: number): string {
  if (geom.type === "rect") {
    return `<rect x="${geom.x * w}" y="${geom.y * h}" width="${geom.w * w}" height="${geom.h * h}" fill="none" stroke="#111" stroke-width="${geom.strokeWidth ?? 1}"/>`;
  }
  return `<line x1="${geom.x1 * w}" y1="${geom.y1 * h}" x2="${geom.x2 * w}" y2="${geom.y2 * h}" stroke="#111" stroke-width="${geom.strokeWidth ?? 0.5}"/>`;
}

/** Render title block as SVG snippet for website sheet previews (matches PDF template). */
export function renderTitleBlockSvg(
  doc: HousePlanDocument,
  entry: DrawingIndexEntry,
  viewW: number,
  template: TitleBlockTemplate = getTitleBlockTemplate(),
): string {
  const tbH = Math.round(viewW * (template.heightPt / 1190.55));
  const w = viewW;
  const h = tbH;

  let svg = `<g class="title-block">`;
  svg += `<rect x="0" y="0" width="${w}" height="${h}" fill="#fafafa" stroke="#111" stroke-width="1"/>`;

  for (const geom of template.geometry) {
    svg += svgGeometry(geom, w, h);
  }

  for (const label of template.labels ?? []) {
    svg += `<text x="${label.x * w}" y="${label.y * h}" font-size="${label.fontSize}" fill="#666" font-family="Inter, sans-serif">${esc(label.text)}</text>`;
  }

  const maxLengths = Object.fromEntries(
    template.fields.filter((f) => f.maxLength).map((f) => [f.key, f.maxLength!]),
  ) as Partial<Record<TitleBlockFieldKey, number>>;

  const values = resolveTitleBlockFields(doc, entry, maxLengths);

  for (const slot of template.fields) {
    const value = values[slot.key];
    if (!value) continue;
    svg += `<text x="${slot.x * w}" y="${slot.y * h}" font-size="${slot.fontSize}" font-weight="${slot.bold ? "bold" : "normal"}" fill="${slot.color ?? "#111"}" font-family="Inter, sans-serif">${esc(value)}</text>`;
  }

  svg += `</g>`;
  return svg;
}

/** Composite drawing SVG + title block for full A3 preview frame. */
export function wrapSheetWithTitleBlock(
  drawingSvg: string,
  titleBlockSvg: string,
  viewW = 900,
  titleBlockHeightRatio = 90 / 841.89,
): string {
  const viewH = Math.round(viewW / 1.414);
  const tbH = Math.round(viewH * titleBlockHeightRatio);
  const drawH = viewH - tbH;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewW} ${viewH}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
  <g transform="translate(0,0)">${drawingSvg.replace(/<\/?svg[^>]*>/g, "")}</g>
  <g transform="translate(0, ${drawH}) scale(${viewW / viewW})">${titleBlockSvg}</g>
</svg>`;
}
