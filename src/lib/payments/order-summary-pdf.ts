import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 48;

export type OrderSummaryPdfLine = {
  housePlanId: string;
  supplierName: string;
  planName?: string;
};

export type OrderSummaryPdfInput = {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  lines: OrderSummaryPdfLine[];
  totalThb?: number;
  paidAt?: string;
  /** Present when site-plan addon was purchased. */
  sitePlanInfo?: {
    provinceName: string;
    districtName: string;
    landTitleDeedNumber: string;
  } | null;
};

async function loadFontBytes(file: string): Promise<Uint8Array> {
  const full = path.join(process.cwd(), "src", "assets", "fonts", file);
  const buf = await readFile(full);
  return new Uint8Array(buf);
}

/**
 * One-page Thai order summary PDF for admin fulfilment after SlipMate success.
 * Fields: Customer Name, Phone, House Plan ID, Supplier Name.
 */
export async function generateOrderSummaryPdf(
  input: OrderSummaryPdfInput,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const [regularBytes, boldBytes] = await Promise.all([
    loadFontBytes("NotoSansThai-Regular.ttf"),
    loadFontBytes("NotoSansThai-Bold.ttf"),
  ]);
  const font = await pdf.embedFont(regularBytes);
  const fontBold = await pdf.embedFont(boldBytes);

  const page = pdf.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - MARGIN;

  const draw = (text: string, size: number, bold = false) => {
    const f = bold ? fontBold : font;
    page.drawText(text || "—", {
      x: MARGIN,
      y,
      size,
      font: f,
      color: rgb(0.12, 0.16, 0.22),
      maxWidth: PAGE.width - MARGIN * 2,
    });
    y -= size + 10;
  };

  const field = (label: string, value: string) => {
    draw(label, 10, true);
    draw(value, 12, false);
    y -= 6;
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
    : [{ housePlanId: "—", supplierName: "—" }];

  lines.forEach((line, idx) => {
    draw(`${idx + 1}. ${line.planName || line.housePlanId}`, 11, true);
    field("รหัสแบบบ้าน / House Plan ID", line.housePlanId || "—");
    field("ชื่อซัพพลายเออร์ / Supplier Name", line.supplierName || "—");
    y -= 4;
    if (y < MARGIN + 80) {
      y = PAGE.height - MARGIN;
    }
  });

  y = Math.min(y, MARGIN + 40);
  draw("เอกสารนี้สร้างอัตโนมัติหลังยืนยันสลิป (SlipMate)", 9, false);

  return pdf.save();
}
