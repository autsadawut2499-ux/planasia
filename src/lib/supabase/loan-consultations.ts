import "server-only";
import { createRandomId } from "@/lib/random-id";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import type {
  LoanConsultation,
  LoanConsultationInput,
  LoanOccupation,
} from "@/lib/loan-consultation/types";

interface LoanConsultationRow {
  id: string;
  full_name: string;
  phone: string;
  employment_type: string | null;
  monthly_income_thb: number | null;
  construction_budget_thb: number | null;
  plan_interest: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  pdf_storage_path: string | null;
  line_notified_at: string | null;
  line_notify_error: string | null;
}

function mapOccupation(raw: string | null | undefined): LoanOccupation | undefined {
  if (
    raw === "company_employee" ||
    raw === "business_owner" ||
    raw === "freelance" ||
    raw === "other"
  ) {
    return raw;
  }
  if (raw === "salaried") return "company_employee";
  if (raw === "self_employed") return "freelance";
  return undefined;
}

function mapRow(row: LoanConsultationRow): LoanConsultation {
  return {
    id: row.id,
    planCode: row.plan_interest?.trim() || undefined,
    fullName: row.full_name,
    phone: row.phone,
    occupation: mapOccupation(row.employment_type),
    monthlyIncomeThb:
      row.monthly_income_thb != null ? Number(row.monthly_income_thb) : null,
    constructionBudgetThb:
      row.construction_budget_thb != null ? Number(row.construction_budget_thb) : null,
    notes: row.notes ?? undefined,
    status:
      row.status === "contacted" || row.status === "closed" ? row.status : "new",
    createdAt: row.created_at,
    pdfStoragePath: row.pdf_storage_path,
    lineNotifiedAt: row.line_notified_at,
    lineNotifyError: row.line_notify_error,
  };
}

function parseMoney(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

export function normalizeLoanConsultationInput(
  body: Record<string, unknown>,
): { ok: true; data: LoanConsultationInput } | { ok: false; error: string } {
  const fullName = String(body.fullName ?? body.full_name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  if (fullName.length < 2) return { ok: false, error: "กรุณากรอกชื่อ-นามสกุล" };
  if (phone.length < 8) return { ok: false, error: "กรุณากรอกเบอร์โทรศัพท์ติดต่อ" };

  const occupationRaw = String(
    body.occupation ?? body.employmentType ?? body.employment_type ?? "",
  ).trim();
  const occupation = mapOccupation(occupationRaw) ?? "";

  return {
    ok: true,
    data: {
      planCode:
        String(body.planCode ?? body.plan_code ?? body.planInterest ?? body.plan_interest ?? "")
          .trim()
          .replace(/^#/, "")
          .slice(0, 80) || undefined,
      fullName: fullName.slice(0, 120),
      phone: phone.slice(0, 40),
      occupation,
      monthlyIncomeThb: parseMoney(body.monthlyIncomeThb ?? body.monthly_income_thb),
      constructionBudgetThb: parseMoney(
        body.constructionBudgetThb ?? body.construction_budget_thb,
      ),
      notes: String(body.notes ?? "").trim().slice(0, 2000) || undefined,
    },
  };
}

export async function saveLoanConsultation(
  input: LoanConsultationInput,
): Promise<LoanConsultation> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database is not configured");
  }
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Database is not configured");

  const id = createRandomId();
  const row = {
    id,
    full_name: input.fullName,
    phone: input.phone,
    employment_type: input.occupation || null,
    monthly_income_thb: input.monthlyIncomeThb,
    construction_budget_thb: input.constructionBudgetThb,
    plan_interest: input.planCode ?? null,
    notes: input.notes ?? null,
    status: "new",
  };

  const { data, error } = await sb
    .from("loan_consultations")
    .insert(row)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as LoanConsultationRow);
}

export async function listLoanConsultations(limit = 200): Promise<LoanConsultation[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data, error } = await sb
    .from("loan_consultations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data as LoanConsultationRow[]).map(mapRow);
}

export async function getLoanConsultationById(
  id: string,
): Promise<LoanConsultation | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = getSupabaseAdmin();
  if (!sb) return null;

  const { data, error } = await sb
    .from("loan_consultations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapRow(data as LoanConsultationRow);
}

export async function updateLoanConsultationStatus(
  id: string,
  status: LoanConsultation["status"],
): Promise<LoanConsultation> {
  if (!isSupabaseConfigured()) throw new Error("Database is not configured");
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Database is not configured");

  const { data, error } = await sb
    .from("loan_consultations")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data as LoanConsultationRow);
}

export async function updateLoanConsultationDelivery(
  id: string,
  patch: {
    pdfStoragePath?: string | null;
    lineNotifiedAt?: string | null;
    lineNotifyError?: string | null;
  },
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const sb = getSupabaseAdmin();
  if (!sb) return;

  const row: Record<string, unknown> = {};
  if (patch.pdfStoragePath !== undefined) row.pdf_storage_path = patch.pdfStoragePath;
  if (patch.lineNotifiedAt !== undefined) row.line_notified_at = patch.lineNotifiedAt;
  if (patch.lineNotifyError !== undefined) row.line_notify_error = patch.lineNotifyError;

  if (Object.keys(row).length === 0) return;

  const { error } = await sb.from("loan_consultations").update(row).eq("id", id);
  if (error) throw new Error(error.message);
}
