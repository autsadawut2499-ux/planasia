import { createRenderer } from "@/lib/pdf/renderers/types";
import { addVectorSheet } from "@/lib/pdf/renderers/sheet-page";
import { drawTextLines } from "@/lib/pdf/sheet-renderers";
import { gridPanels } from "@/lib/pdf/vector/layout";
import { INK_DIM, strokeRect, text, textBlock } from "@/lib/pdf/vector/primitives";

export const a0IndexRenderer = createRenderer({
  id: "a0-index",
  label: "Cover Sheet & Index (A0.00)",
  status: "vector-partial",
  matches: (e) => e.sheetNo === "A0.00",
  async render({ pdf, font, fontBold, doc, entry, unitOpts }) {
    await addVectorSheet(pdf, font, fontBold, doc, entry, unitOpts, (ctx, area) => {
      const panels = gridPanels(area, 2, 2, 10);

      // ── Panel 1: Cover page ──
      const cover = panels[0]!;
      strokeRect(ctx.page, cover, 0.75);
      text(ctx.page, "COVER SHEET", { x: cover.x + 8, y: cover.y + cover.height - 16 }, ctx.fontBold, 10, true);
      textBlock(
        ctx.page,
        ctx.font,
        [
          `Project: ${doc.project.projectName || "—"}`,
          `Building owner: ${doc.project.ownerName || "—"}`,
            `Architect / Engineer: Titan Box AI + User Design`,
          `Building code: ${doc.buildingCode}`,
          `Model: Smart A TYPE E (DPT Golden Standard)`,
        ],
        { x: cover.x + 8, y: cover.y + cover.height - 36 },
        8,
        13,
      );

      // ── Panel 2: Location map — intentionally blank for user ──
      const location = panels[1]!;
      strokeRect(ctx.page, location, 0.75);
      text(ctx.page, "LOCATION / SITE MAP", { x: location.x + 8, y: location.y + location.height - 16 }, ctx.fontBold, 9, true);
      text(
        ctx.page,
        "(Blank — for user to complete)",
        { x: location.x + 8, y: location.y + location.height / 2 },
        ctx.font,
        8,
        false,
        INK_DIM,
      );
      strokeRect(
        ctx.page,
        { x: location.x + 12, y: location.y + 12, width: location.width - 24, height: location.height - 36 },
        0.35,
      );

      // ── Panel 3: Drawing index ──
      const indexPanel = panels[2]!;
      strokeRect(ctx.page, indexPanel, 0.75);
      text(ctx.page, "DRAWING INDEX", { x: indexPanel.x + 8, y: indexPanel.y + indexPanel.height - 16 }, ctx.fontBold, 9, true);
      const indexLines = doc.index
        .filter((e) => e.sheetNo !== "TB")
        .map((e) => `${e.sheetNo}  ${e.title}`);
      drawTextLines(
        ctx.page,
        ctx.font,
        indexLines.slice(0, 14),
        indexPanel.x + 8,
        indexPanel.y + indexPanel.height - 32,
        7,
        10,
      );
      if (indexLines.length > 14) {
        text(
          ctx.page,
          `… +${indexLines.length - 14} more sheets`,
          { x: indexPanel.x + 8, y: indexPanel.y + 8 },
          ctx.font,
          6,
        );
      }

      // ── Panel 4: Symbols & abbreviations (placeholder legend) ──
      const symbols = panels[3]!;
      strokeRect(ctx.page, symbols, 0.75);
      text(
        ctx.page,
        "GENERAL SYMBOLS & ABBREVIATIONS",
        { x: symbols.x + 8, y: symbols.y + symbols.height - 16 },
        ctx.fontBold,
        8,
        true,
      );
      drawTextLines(
        ctx.page,
        ctx.font,
        [
          "[Pending full DPT symbol legend]",
          "①–④  Elevation view markers",
          "N/A   Not to scale",
          "SN    Sanitary",
          "E     Electrical",
          "S     Structural",
          "m     meters (metric)",
        ],
        symbols.x + 8,
        symbols.y + symbols.height - 32,
        7,
        11,
      );
    });
    return true;
  },
});
