import { createRenderer } from "@/lib/pdf/renderers/types";
import { addVectorSheet } from "@/lib/pdf/renderers/sheet-page";
import { drawElevationPlaceholderSheetPdf } from "@/lib/pdf/elevation-markers-draw";

export const a4ElevationsRenderer = createRenderer({
  id: "a4-elevations",
  label: "Elevations (A4.00)",
  status: "vector-partial",
  matches: (e) => e.sheetNo === "A4.00",
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
      drawElevationPlaceholderSheetPdf(ctx.page, ctx.font, ctx.fontBold, area);
    });
    return true;
  },
});
