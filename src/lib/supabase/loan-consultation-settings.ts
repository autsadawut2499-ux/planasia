import "server-only";

import {
  DEFAULT_LOAN_CONSULTATION_SETTINGS,
  normalizeLoanConsultationSettings,
  type LoanConsultationSettings,
} from "@/lib/loan-consultation/settings";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export const LOAN_CONSULTATION_SETTINGS_KEY = "loan_consultation";

export async function loadLoanConsultationSettings(): Promise<LoanConsultationSettings> {
  if (!isSupabaseConfigured()) {
    return { ...DEFAULT_LOAN_CONSULTATION_SETTINGS };
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", LOAN_CONSULTATION_SETTINGS_KEY)
      .maybeSingle();
    if (error || !data?.value) {
      return { ...DEFAULT_LOAN_CONSULTATION_SETTINGS };
    }
    return normalizeLoanConsultationSettings(data.value);
  } catch {
    return { ...DEFAULT_LOAN_CONSULTATION_SETTINGS };
  }
}

export async function saveLoanConsultationSettings(
  value: LoanConsultationSettings,
  updatedBy: string,
): Promise<LoanConsultationSettings> {
  const normalized = normalizeLoanConsultationSettings(value);
  if (!isSupabaseConfigured()) {
    throw new Error("Database is not configured");
  }
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        key: LOAN_CONSULTATION_SETTINGS_KEY,
        value: normalized,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "key" },
    );
  if (error) throw new Error(error.message);
  return normalized;
}

/** Token for Messaging API — admin setting overrides env. */
export function resolveLineChannelAccessToken(
  settings: LoanConsultationSettings,
): string {
  return (
    settings.lineChannelAccessToken.trim() ||
    process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() ||
    ""
  );
}
