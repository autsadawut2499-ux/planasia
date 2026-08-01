import { createRenderer } from "@/lib/pdf/renderers/types";
import { addVectorSheet } from "@/lib/pdf/renderers/sheet-page";
import { drawTextLines } from "@/lib/pdf/sheet-renderers";
import { formatSetback, formatSizePair, PDF_NOTE_SIZE } from "@/lib/units/format";

export const a1SitePlanRenderer = createRenderer({
  id: "a1-site-plan",
  label: "Site Plan (A1.00)",
  status: "data-placeholder",
  matches: (e) => e.sheetNo === "A1.00",
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
      const sp = doc.sitePlan;
      drawTextLines(
        ctx.page,
        ctx.font,
        [
          "[Pending vector site plan — data sheet only]",
          "",
          `Plot: ${formatSizePair(sp.plotWidth, sp.plotDepth, unitOpts)}`,
          `Building footprint: ${formatSizePair(sp.building.width, sp.building.depth, unitOpts)} @ (${sp.building.x}, ${sp.building.y}) m`,
          `Setbacks — Front: ${formatSetback(sp.setbacks.front, unitOpts)}  Rear: ${formatSetback(sp.setbacks.rear, unitOpts)}`,
          `  Left: ${formatSetback(sp.setbacks.left, unitOpts)}  Right: ${formatSetback(sp.setbacks.right, unitOpts)}`,
          `Road side (reference): ${sp.roadSide}  |  Entrance: ${sp.entrance}`,
        ],
        area.x,
        area.y + area.height,
        PDF_NOTE_SIZE,
        14,
      );
    });
    return true;
  },
});
