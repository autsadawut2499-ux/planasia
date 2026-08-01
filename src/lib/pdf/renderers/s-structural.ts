import { createRenderer } from "@/lib/pdf/renderers/types";
import { addVectorSheet } from "@/lib/pdf/renderers/sheet-page";
import { drawTextLines } from "@/lib/pdf/sheet-renderers";
import { formatDimension, formatSpan } from "@/lib/units/format";

export const sStructuralRenderer = createRenderer({
  id: "s-structural",
  label: "Structural (S-series)",
  status: "data-placeholder",
  matches: (e) => e.category === "S" && e.sheetNo.startsWith("S"),
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    if (!doc.planOptions.includeStructural) return false;

    const { sheetNo } = entry;
    const st = doc.structural;

    if (sheetNo === "S1.00") {
      await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
        drawTextLines(
          ctx.page,
          ctx.font,
          [
            "[Pending vector structural plan]",
            "",
            `Foundation type: ${st.foundationType}`,
            "Elements:",
            ...st.elements.map(
              (e) =>
                `  [${e.type.toUpperCase()}] ${e.label} — ${e.size} @ ${e.location}${e.reinforcement ? ` (${e.reinforcement})` : ""}`,
            ),
          ],
          area.x,
          area.y + area.height,
          8,
          14,
        );
      });
      return true;
    }

    if (sheetNo === "S2.00") {
      await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
        drawTextLines(
          ctx.page,
          ctx.font,
          ["[Pending vector structural details]", ...st.beamSpans.map((b) => `${b.id}: span ${formatSpan(b.span, unitOpts)} — ${b.size} mm`)],
          area.x,
          area.y + area.height,
          9,
          16,
        );
      });
      return true;
    }

    if (sheetNo === "S3.00") {
      await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
        drawTextLines(
          ctx.page,
          ctx.font,
          ["[Pending vector footing & column detail]", ...st.calculationSummary.slice(0, 4)],
          area.x,
          area.y + area.height,
          8,
          14,
        );
      });
      return true;
    }

    if (sheetNo === "S4.00") {
      await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
        drawTextLines(
          ctx.page,
          ctx.font,
          [
            "[Pending vector roof structure plan]",
            `Roof type: ${doc.roofPlan.type}`,
            `Purlin spacing: ${formatDimension(1.0, unitOpts)}`,
          ],
          area.x,
          area.y + area.height,
          9,
          16,
        );
      });
      return true;
    }

    if (sheetNo === "S5.00") {
      await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
        drawTextLines(ctx.page, ctx.font, ["[Pending vector calc report]", ...st.calculationSummary], area.x, area.y + area.height, 9, 16);
        ctx.page.drawText("Signed by licensed structural engineer: _________________________", {
          x: area.x,
          y: area.y + 40,
          size: 8,
          font: ctx.font,
        });
      });
      return true;
    }

    return false;
  },
});
