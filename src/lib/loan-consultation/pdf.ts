import "server-only";

import { PDFDocument, rgb } from "pdf-lib";
import {
  LOAN_BUDGET_PRESETS,
  LOAN_OCCUPATION_OPTIONS,
  type LoanConsultation,
} from "@/lib/loan-consultation/types";
import { embedThaiFonts, pdfSafeText } from "@/lib/pdf/thai-fonts";

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 48;

function formatMoney(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `฿${Math.round(n).toLocaleString("th-TH")}`;
}

function occupationLabel(id: string | undefined): string {
  if (!id) return "—";
  const opt = LOAN_OCCUPATION_OPTIONS.find((o) => o.id === id);
  return opt ? `${opt.th} / ${opt.en}` : id;
}

function budgetLabel(n: number | null | undefined): string {
  if (n == null) return "—";
  const preset = LOAN_BUDGET_PRESETS.find((p) => p.value === n);
  if (preset) return `${preset.th} (${formatMoney(n)})`;
  return formatMoney(n);
}

/**
 * Build a one-page Thai/English PDF summary of a loan consultation submission.
 */
export async function generateLoanConsultationPdf(
  row: LoanConsultation,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const { regular: font, bold: fontBold } = await embedThaiFonts(pdf);

  const page = pdf.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - MARGIN;

  const draw = (text: string, size: number, bold = false) => {
    const f = bold ? fontBold : font;
    page.drawText(pdfSafeText(text), {
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

  draw("Planasia — ปรึกษาสินเชื่อบ้าน", 16, true);
  draw("Home Loan Consultation Request", 11, false);
  y -= 8;

  const created = new Date(row.createdAt).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  field("วันที่ส่ง / Submitted", created);
  field("รหัสอ้างอิง / Reference ID", row.id);
  field("รหัสแบบบ้านที่สนใจ / House Code", row.planCode?.trim() || "—");
  field("ชื่อ-นามสกุล / Full Name", row.fullName);
  field("เบอร์โทรศัพท์ / Phone", row.phone);
  field("อาชีพ / Occupation", occupationLabel(row.occupation || undefined));
  field("รายได้ต่อเดือน / Monthly Income", formatMoney(row.monthlyIncomeThb));
  field(
    "งบประมาณค่าก่อสร้าง / Construction Budget",
    budgetLabel(row.constructionBudgetThb),
  );
  field("หมายเหตุ / Notes", (row.notes?.trim() || "—").slice(0, 1200));

  y -= 12;
  draw("สร้างโดย Planasia · ไม่ใช่ใบอนุมัติสินเชื่อ", 9, false);

  return pdf.save();
}
