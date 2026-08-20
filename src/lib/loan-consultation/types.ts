/** Types for home-loan consultation inquiries. */

export type LoanOccupation =
  | "company_employee"
  | "business_owner"
  | "freelance"
  | "other";

export interface LoanConsultationInput {
  /** House plan code from the store (e.g. MOD-001). */
  planCode?: string;
  fullName: string;
  phone: string;
  occupation?: LoanOccupation | "";
  monthlyIncomeThb?: number | null;
  constructionBudgetThb?: number | null;
  notes?: string;
}

export interface LoanConsultation extends LoanConsultationInput {
  id: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
  /** Private storage path for generated PDF (if any). */
  pdfStoragePath?: string | null;
  lineNotifiedAt?: string | null;
  lineNotifyError?: string | null;
}

/** Occupation dropdown — matches consultation form labels. */
export const LOAN_OCCUPATION_OPTIONS: Array<{
  id: LoanOccupation;
  th: string;
  en: string;
}> = [
  { id: "company_employee", th: "พนักงานบริษัท", en: "Company Employee" },
  { id: "business_owner", th: "เจ้าของธุรกิจ", en: "Business Owner" },
  { id: "freelance", th: "ฟรีแลนซ์ / อาชีพอิสระ", en: "Freelance" },
  { id: "other", th: "อื่นๆ", en: "Other" },
];

/** Optional construction budget presets (THB). */
export const LOAN_BUDGET_PRESETS: Array<{
  value: number;
  th: string;
  en: string;
}> = [
  { value: 1_500_000, th: "ไม่เกิน 1.5 ล้าน", en: "Up to ฿1.5M" },
  { value: 2_500_000, th: "1.5–2.5 ล้าน", en: "฿1.5–2.5M" },
  { value: 3_500_000, th: "2.5–3.5 ล้าน", en: "฿2.5–3.5M" },
  { value: 5_000_000, th: "3.5–5 ล้าน", en: "฿3.5–5M" },
  { value: 7_500_000, th: "5 ล้านขึ้นไป", en: "฿5M+" },
];
