import "server-only";

import {
  DEFAULT_ORDER_NOTIFY_SETTINGS,
  normalizeOrderNotifySettings,
  type OrderNotifySettings,
} from "@/lib/payments/order-notify-settings";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import { loadLoanConsultationSettings } from "@/lib/supabase/loan-consultation-settings";

export const ORDER_NOTIFY_SETTINGS_KEY = "order_notifications";

export async function loadOrderNotifySettings(): Promise<OrderNotifySettings> {
  if (!isSupabaseConfigured()) {
    return { ...DEFAULT_ORDER_NOTIFY_SETTINGS };
  }
  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", ORDER_NOTIFY_SETTINGS_KEY)
      .maybeSingle();
    if (error || !data?.value) {
      return { ...DEFAULT_ORDER_NOTIFY_SETTINGS };
    }
    return normalizeOrderNotifySettings(data.value);
  } catch {
    return { ...DEFAULT_ORDER_NOTIFY_SETTINGS };
  }
}

export async function saveOrderNotifySettings(
  value: OrderNotifySettings,
  updatedBy: string,
): Promise<OrderNotifySettings> {
  const normalized = normalizeOrderNotifySettings(value);
  if (!isSupabaseConfigured()) {
    throw new Error("Database is not configured");
  }
  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        key: ORDER_NOTIFY_SETTINGS_KEY,
        value: normalized,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "key" },
    );
  if (error) throw new Error(error.message);
  return normalized;
}

/** Resolve Messaging API token: order settings → loan consultation → env. */
export async function resolveOrderNotifyLineToken(
  settings?: OrderNotifySettings,
): Promise<string> {
  const local = settings ?? (await loadOrderNotifySettings());
  if (local.lineChannelAccessToken.trim()) {
    return local.lineChannelAccessToken.trim();
  }
  const loan = await loadLoanConsultationSettings();
  if (loan.lineChannelAccessToken.trim()) {
    return loan.lineChannelAccessToken.trim();
  }
  return process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() || "";
}
