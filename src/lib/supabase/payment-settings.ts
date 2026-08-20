import "server-only";

import {
  DEFAULT_PAYMENT_SETTINGS,
  normalizePaymentSettings,
  type PaymentSettings,
} from "@/lib/payments/settings";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export const PAYMENT_SETTINGS_KEY = "payment";

export async function loadPaymentSettings(): Promise<PaymentSettings> {
  if (!isSupabaseConfigured()) {
    return { ...DEFAULT_PAYMENT_SETTINGS };
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", PAYMENT_SETTINGS_KEY)
      .maybeSingle();
    if (error || !data?.value) {
      return { ...DEFAULT_PAYMENT_SETTINGS };
    }
    return normalizePaymentSettings(data.value);
  } catch {
    return { ...DEFAULT_PAYMENT_SETTINGS };
  }
}

export async function savePaymentSettings(
  value: PaymentSettings,
  updatedBy: string,
): Promise<PaymentSettings> {
  const normalized = normalizePaymentSettings(value);
  if (!isSupabaseConfigured()) {
    throw new Error("Database is not configured");
  }

  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        key: PAYMENT_SETTINGS_KEY,
        value: normalized,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "key" },
    );
  if (error) throw new Error(error.message);
  return normalized;
}
