import { PDFDocument, degrees, rgb } from "pdf-lib";
import type { UiLocale } from "@/lib/geo/countries";
import { UI_LOCALE_META } from "@/lib/geo/countries";

/**
 * Stamp a light diagonal buyer watermark + footer on every page of a purchased
 * PDF. Uses the checkout language for the footer label when possible.
 */
export async function stampBuyerPdf(
  pdfBytes: Uint8Array,
  opts: {
    buyerLabel?: string;
    uiLocale?: UiLocale | string;
    orderId?: string;
  },
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(pdfBytes);
  const pages = pdf.getPages();
  const lang = (opts.uiLocale && opts.uiLocale in UI_LOCALE_META
    ? UI_LOCALE_META[opts.uiLocale as UiLocale].native
    : "EN") as string;

  const watermark = (opts.buyerLabel || "LICENSED COPY").slice(0, 48);
  const footer = [
    opts.buyerLabel ? `Licensed to: ${opts.buyerLabel}` : "Licensed digital copy",
    opts.orderId ? `Order ${opts.orderId}` : null,
    `Lang: ${lang}`,
  ]
    .filter(Boolean)
    .join(" · ");

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(watermark, {
      x: width * 0.15,
      y: height * 0.45,
      size: 28,
      rotate: degrees(32),
      color: rgb(0.55, 0.55, 0.55),
      opacity: 0.18,
    });
    page.drawText(footer.slice(0, 120), {
      x: 36,
      y: 18,
      size: 7,
      color: rgb(0.35, 0.35, 0.35),
      opacity: 0.85,
    });
  }

  return pdf.save();
}
