import "server-only";

import { pushLineTextMessage } from "@/lib/line/push-text";
import type { LoanConsultation } from "@/lib/loan-consultation/types";
import type { LoanConsultationSettings } from "@/lib/loan-consultation/settings";
import { resolveLineChannelAccessToken } from "@/lib/supabase/loan-consultation-settings";
import {
  LOAN_BUDGET_PRESETS,
  LOAN_OCCUPATION_OPTIONS,
} from "@/lib/loan-consultation/types";

function money(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `฿${Math.round(n).toLocaleString("th-TH")}`;
}

function occupationTh(id: string | undefined): string {
  if (!id) return "—";
  return LOAN_OCCUPATION_OPTIONS.find((o) => o.id === id)?.th ?? id;
}

function budgetTh(n: number | null | undefined): string {
  if (n == null) return "—";
  const preset = LOAN_BUDGET_PRESETS.find((p) => p.value === n);
  return preset ? preset.th : money(n);
}

export interface LineDeliveryResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

/**
 * Push consultation summary + PDF download link to the expert via LINE Messaging API.
 * LINE cannot attach arbitrary PDF files; we send a text message with a signed HTTPS link.
 */
export async function sendLoanConsultationToLineExpert(opts: {
  consultation: LoanConsultation;
  settings: LoanConsultationSettings;
  pdfUrl: string;
}): Promise<LineDeliveryResult> {
  const token = resolveLineChannelAccessToken(opts.settings);
  const to = opts.settings.expertLineUserId.trim();

  const c = opts.consultation;
  const text = [
    "🏠 คำขอปรึกษาสินเชื่อบ้านใหม่",
    "",
    `รหัสอ้างอิง: ${c.id}`,
    `รหัสแบบบ้าน: ${c.planCode?.trim() || "—"}`,
    `ชื่อ: ${c.fullName}`,
    `โทร: ${c.phone}`,
    `อาชีพ: ${occupationTh(c.occupation || undefined)}`,
    `รายได้/เดือน: ${money(c.monthlyIncomeThb)}`,
    `งบก่อสร้าง: ${budgetTh(c.constructionBudgetThb)}`,
    `หมายเหตุ: ${(c.notes?.trim() || "—").slice(0, 400)}`,
    "",
    `📄 ดาวน์โหลด PDF: ${opts.pdfUrl}`,
  ].join("\n");

  return pushLineTextMessage({
    channelAccessToken: token,
    toUserId: to,
    text,
  });
}
