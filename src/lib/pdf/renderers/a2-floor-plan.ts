import { createRenderer } from "@/lib/pdf/renderers/types";
import { addVectorSheet } from "@/lib/pdf/renderers/sheet-page";
import { drawFloorPlan, drawTextLines } from "@/lib/pdf/sheet-renderers";
import {
  drawElevationMarkersPdf,
  floorPlanTransform,
} from "@/lib/pdf/elevation-markers-draw";
import type { FloorPlanSheet } from "@/lib/plans/schema";
import { formatArea } from "@/lib/units/format";

function floorPlanIndex(sheetNo: string): number {
  const match = /^A2\.(\d+)$/.exec(sheetNo);
  return match ? parseInt(match[1]!, 10) : 0;
}

export const a2FloorPlanRenderer = createRenderer({
  id: "a2-floor-plan",
  label: "Floor Plan (A2.xx)",
  status: "vector-partial",
  matches: (e) => e.sheetNo.startsWith("A2."),
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    const fp = doc.floorPlans[floorPlanIndex(entry.sheetNo)] as FloorPlanSheet | undefined;
    if (!fp) return false;

    await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
      drawFloorPlan(ctx.page, ctx.font, ctx.fontBold, fp.rooms, area, fp.scale, unitOpts);
      const transform = floorPlanTransform(fp.rooms, area);
      if (transform) {
        drawElevationMarkersPdf(ctx.page, ctx.font, ctx.fontBold, fp.rooms, transform);
      }
      ctx.page.drawText(`Gross area: ${formatArea(fp.grossArea, unitOpts)}`, {
        x: area.x,
        y: area.y - 10,
        size: 8,
        font: ctx.font,
      });
    });
    return true;
  },
});
