import { createRenderer } from "@/lib/pdf/renderers/types";
import { addVectorSheet } from "@/lib/pdf/renderers/sheet-page";
import { drawTextLines } from "@/lib/pdf/sheet-renderers";
import { formatElevation } from "@/lib/units/format";

export const a5SectionsRenderer = createRenderer({
  id: "a5-sections",
  label: "Sections (A5.00)",
  status: "data-placeholder",
  matches: (e) => e.sheetNo === "A5.00",
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
      doc.sections.forEach((sec, idx) => {
        const y = area.y + area.height - idx * 160;
        ctx.page.drawText(`${sec.label} (${sec.id}) / ${sec.labelTh}`, {
          x: area.x,
          y,
          size: 9,
          font: ctx.fontBold,
        });
        drawTextLines(
          ctx.page,
          ctx.font,
          [
            `[Pending vector section drawing]`,
            `Cut: ${sec.cutDirection}`,
            ...sec.floorLevels.map((l) => `  ${l.name}: +${formatElevation(l.elevation, unitOpts)}`),
            ...sec.notes.map((n) => `  • ${n}`),
          ],
          area.x,
          y - 16,
          8,
          13,
        );
      });
    });
    return true;
  },
});
