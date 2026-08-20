import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import {
  LOAN_BUDGET_PRESETS,
  LOAN_OCCUPATION_OPTIONS,
  type LoanConsultation,
} from "@/lib/loan-consultation/types";

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

async function loadFontBytes(file: string): Promise<Uint8Array> {
  const full = path.join(process.cwd(), "src", "assets", "fonts", file);
  const buf = await readFile(full);
  return new Uint8Array(buf);
}

/**
 * Build a one-page Thai/English PDF summary of a loan consultation submission.
 */
export async function generateLoanConsultationPdf(
  row: LoanConsultation,
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
    const safe = text || "—";
    page.drawText(safe, {
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
