import { createRenderer } from "@/lib/pdf/renderers/types";
import { addVectorSheet } from "@/lib/pdf/renderers/sheet-page";
import { drawTextLines } from "@/lib/pdf/sheet-renderers";

export const a3RoofPlanRenderer = createRenderer({
  id: "a3-roof-plan",
  label: "Roof Plan (A3.00)",
  status: "data-placeholder",
  matches: (e) => e.sheetNo === "A3.00",
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
      const rp = doc.roofPlan;
      drawTextLines(
        ctx.page,
        ctx.font,
        [
          "[Pending vector roof plan]",
          "",
          `Roof type: ${rp.type}`,
          `Slope: ${rp.slope}`,
          `Material: ${rp.material}`,
          "Drainage:",
          ...rp.drainage.map((d) => `  • ${d}`),
        ],
        area.x,
        area.y + area.height,
        9,
        16,
      );
    });
    return true;
  },
});
