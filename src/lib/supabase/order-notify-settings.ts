import "server-only";

import {
  DEFAULT_ORDER_NOTIFY_SETTINGS,
  normalizeOrderNotifySettings,
  type OrderNotifySettings,
} from "@/lib/payments/order-notify-settings";
import { isValidLineUserId } from "@/lib/line/push-text";
import { listLineUserSightings } from "@/lib/line/sightings";
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

export type AdminLineDestinationSource = "settings" | "loan" | "webhook" | "none";

/**
 * Resolve who should receive admin order pushes.
 * Settings U… id first, then loan-consultation expert id, then latest webhook sighting.
 */
export async function resolveAdminLineDestinations(
  settings?: OrderNotifySettings,
): Promise<{ ids: string[]; source: AdminLineDestinationSource }> {
  const local = settings ?? (await loadOrderNotifySettings());
  if (isValidLineUserId(local.adminLineUserId)) {
    return { ids: [local.adminLineUserId.trim()], source: "settings" };
  }

  const loan = await loadLoanConsultationSettings();
  if (isValidLineUserId(loan.expertLineUserId)) {
    return { ids: [loan.expertLineUserId.trim()], source: "loan" };
  }

  const sightings = await listLineUserSightings();
  const fromWebhook = sightings.find((s) => isValidLineUserId(s.userId))?.userId;
  if (fromWebhook) {
    return { ids: [fromWebhook.trim()], source: "webhook" };
  }

  return { ids: [], source: "none" };
}

/**
 * One-time bootstrap: if payment settings have no admin LINE User ID yet,
 * save the first valid U… id captured from the Messaging API webhook.
 */
export async function adoptAdminLineUserIdIfEmpty(
  userId: string,
): Promise<boolean> {
  const id = userId.trim();
  if (!isValidLineUserId(id) || !isSupabaseConfigured()) return false;
  const current = await loadOrderNotifySettings();
  if (isValidLineUserId(current.adminLineUserId)) return false;
  await saveOrderNotifySettings(
    { ...current, adminLineUserId: id },
    "line-webhook",
  );
  console.info("[order-notify] adopted admin LINE user id from webhook");
  return true;
}
