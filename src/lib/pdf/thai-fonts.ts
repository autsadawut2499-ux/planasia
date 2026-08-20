import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import type { PDFDocument, PDFFont } from "pdf-lib";

/**
 * Sarabun (OFL) — full Thai + Latin coverage for pdf-lib.
 * Noto Sans Thai was previously used but its Latin glyphs render as tofu
 * boxes in PDF viewers when mixed with Thai text.
 *
 * Embed the complete font (subset: false) so every Thai/Latin codepoint
 * used in order summaries is present.
 */
const FONT_FILES = {
  regular: "Sarabun-Regular.ttf",
  bold: "Sarabun-Bold.ttf",
} as const;

async function loadFontBytes(file: string): Promise<Uint8Array> {
  const full = path.join(process.cwd(), "src", "assets", "fonts", file);
  const buf = await readFile(full);
  return new Uint8Array(buf);
}

export type EmbeddedThaiFonts = {
  regular: PDFFont;
  bold: PDFFont;
};

export async function embedThaiFonts(pdf: PDFDocument): Promise<EmbeddedThaiFonts> {
  pdf.registerFontkit(fontkit);
  const [regularBytes, boldBytes] = await Promise.all([
    loadFontBytes(FONT_FILES.regular),
    loadFontBytes(FONT_FILES.bold),
  ]);
  const [regular, bold] = await Promise.all([
    pdf.embedFont(regularBytes, { subset: false }),
    pdf.embedFont(boldBytes, { subset: false }),
  ]);
  return { regular, bold };
}

/** Normalize to NFC so Thai combining marks map to font glyphs reliably. */
export function pdfSafeText(text: string): string {
  return (text || "—").normalize("NFC");
}
