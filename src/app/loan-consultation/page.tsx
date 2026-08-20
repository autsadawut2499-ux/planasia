import type { Metadata } from "next";
import { LoanConsultationPageClient } from "./LoanConsultationPageClient";
import { resolveLineChatUrl } from "@/lib/loan-consultation/settings";
import { getSiteUrl } from "@/lib/seo/site-url";
import { loadLoanConsultationSettings } from "@/lib/supabase/loan-consultation-settings";

export const metadata: Metadata = {
  title: "ปรึกษาสินเชื่อบ้านครบวงจร | Home Loan Consultation | Planasia",
  description:
    "ปรึกษาสินเชื่อบ้านครบวงจรกับผู้เชี่ยวชาญ — ให้คำแนะนำ ช่วยเตรียมเอกสาร และดูแลตั้งแต่ต้นน้ำยันปลายน้ำ เพื่อเพิ่มโอกาสอนุมัติวงเงินกู้",
  alternates: { canonical: `${getSiteUrl()}/loan-consultation` },
};

export default async function LoanConsultationPage() {
  const settings = await loadLoanConsultationSettings();
  const expertLineOaUrl = resolveLineChatUrl(settings.expertLineOaUrl);

  return <LoanConsultationPageClient expertLineOaUrl={expertLineOaUrl} />;
}
