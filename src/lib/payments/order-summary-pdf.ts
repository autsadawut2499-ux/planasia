import "server-only";

import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { embedThaiFonts, pdfSafeText } from "@/lib/pdf/thai-fonts";

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 48;
const CONTENT_WIDTH = PAGE.width - MARGIN * 2;

export type OrderSummaryPdfLine = {
  housePlanId: string;
  supplierName: string;
  planName?: string;
  /** Original supplier house code — always print this field. */
  originalHouseCode: string;
  /** Order/sale note — always print this field. */
  note: string;
  costPrice?: string;
};

export type OrderSummaryPdfInput = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  lines: OrderSummaryPdfLine[];
  totalThb?: number;
  paidAt?: string;
  orderNote?: string;
  /** Present when site-plan addon was purchased. */
  sitePlanInfo?: {
    provinceName: string;
    districtName: string;
    landTitleDeedNumber: string;
  } | null;
};

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const safe = pdfSafeText(text || "—");
  const words = safe.split(/\s+/).filter(Boolean);
  if (!words.length) return ["—"];
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : ["—"];
}

/**
 * Thai order summary PDF for admin fulfilment after SlipMate success.
 * Every item always includes Original House Code and Note.
 */
export async function generateOrderSummaryPdf(
  input: OrderSummaryPdfInput,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const { regular: font, bold: fontBold } = await embedThaiFonts(pdf);

  let page: PDFPage = pdf.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - MARGIN;

  const ensureSpace = (needed: number) => {
    if (y - needed >= MARGIN) return;
    page = pdf.addPage([PAGE.width, PAGE.height]);
    y = PAGE.height - MARGIN;
  };

  const draw = (text: string, size: number, bold = false) => {
    const f = bold ? fontBold : font;
    const lines = wrapText(text, f, size, CONTENT_WIDTH);
    for (const line of lines) {
      ensureSpace(size + 10);
      page.drawText(line, {
        x: MARGIN,
        y,
        size,
        font: f,
        color: rgb(0.12, 0.16, 0.22),
      });
      y -= size + 8;
    }
  };

  const field = (label: string, value: string) => {
    draw(label, 10, true);
    draw(value || "—", 12, false);
    y -= 4;
  };

  draw("Planasia — สรุปคำสั่งซื้อ", 16, true);
  draw("Order Summary (Post-Payment)", 11, false);
  y -= 8;

  field("รหัสคำสั่งซื้อ / Order ID", input.orderId);
  field("ชื่อลูกค้า / Customer Name", input.customerName || "—");
  field("เบอร์โทร / Customer Phone", input.customerPhone || "—");
  if (input.customerEmail) {
    field("อีเมล / Email", input.customerEmail);
  }
  if (input.paidAt) {
    field("ชำระเงินเมื่อ / Paid at", input.paidAt);
  }
  if (input.totalThb != null && Number.isFinite(input.totalThb)) {
    field(
      "ยอดชำระ / Amount",
      `฿${Math.round(input.totalThb).toLocaleString("th-TH")}`,
    );
  }
  if (input.orderNote?.trim()) {
    field("หมายเหตุออเดอร์ / Order note", input.orderNote.trim());
  }

  if (input.sitePlanInfo) {
    y -= 4;
    draw("ข้อมูลแผนผังบริเวณ / Site plan information", 12, true);
    y -= 4;
    field("จังหวัด / Province", input.sitePlanInfo.provinceName || "—");
    field("อำเภอ / District", input.sitePlanInfo.districtName || "—");
    field(
      "เลขโฉนดที่ดิน / Land title deed number",
      input.sitePlanInfo.landTitleDeedNumber || "—",
    );
  }

  y -= 4;
  draw("รายการแบบบ้าน / House plans", 12, true);
  y -= 4;

  const lines = input.lines.length
    ? input.lines
    : [
        {
          housePlanId: "—",
          supplierName: "—",
          originalHouseCode: "—",
          note: "—",
        },
      ];

  lines.forEach((line, idx) => {
    ensureSpace(140);
    draw(`${idx + 1}. ${line.planName || line.housePlanId}`, 11, true);
    field("รหัสแบบบ้าน / House Plan ID", line.housePlanId || "—");
    field("ชื่อซัพพลายเออร์ / Supplier Name", line.supplierName || "—");
    field(
      "รหัสบ้านต้นทาง / Original House Code",
      line.originalHouseCode?.trim() || "—",
    );
    field("โน้ต / Note", line.note?.trim() || "—");
    if (line.costPrice) {
      field("ราคาต้นทุน / Cost Price", line.costPrice);
    }
    y -= 6;
  });

  ensureSpace(24);
  draw("เอกสารนี้สร้างอัตโนมัติหลังยืนยันสลิป (SlipMate)", 9, false);

  return pdf.save();
}
