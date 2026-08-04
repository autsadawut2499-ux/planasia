import "server-only";

import { createRandomId } from "@/lib/random-id";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export interface SmsDeliveryEventInput {
  provider?: string;
  messageId?: string | null;
  phone?: string | null;
  status?: string | null;
  statusCode?: string | null;
  credit?: number | null;
  cartOrderId?: string | null;
  ownerKey?: string | null;
  raw?: unknown;
}

/** Persist a ThaiBulkSMS (or other) delivery-status webhook for audit. */
export async function recordSmsDeliveryEvent(
  input: SmsDeliveryEventInput,
): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured()) return null;

  const id = createRandomId();
  const row = {
    id,
    provider: input.provider ?? "thaibulksms",
    message_id: input.messageId?.trim() || null,
    phone: input.phone?.trim() || null,
    status: input.status?.trim() || null,
    status_code: input.statusCode?.trim() || null,
    credit: input.credit ?? null,
    cart_order_id: input.cartOrderId ?? null,
    owner_key: input.ownerKey ?? null,
    payload: input.raw ?? null,
    created_at: new Date().toISOString(),
  };

  const { error } = await getSupabaseAdmin().from("sms_delivery_events").insert(row);
  if (error) {
    console.error("[sms-delivery] insert failed", error.message);
    return null;
  }
  return { id };
}

/**
 * Best-effort: if we know the provider message id, update the matching
 * vendor_sale_notifications row with the latest delivery status.
 */
export async function patchSaleNotificationByMessageId(
  messageId: string,
  patch: { smsStatus?: string; smsError?: string | null },
): Promise<void> {
  if (!isSupabaseConfigured() || !messageId.trim()) return;

  const row: Record<string, unknown> = {};
  if (patch.smsStatus) row.sms_status = patch.smsStatus;
  if (patch.smsError !== undefined) row.sms_error = patch.smsError;
  if (Object.keys(row).length === 0) return;

  const { error } = await getSupabaseAdmin()
    .from("vendor_sale_notifications")
    .update(row)
    .eq("sms_message_id", messageId.trim());

  // Column may not exist yet — ignore quietly.
  if (error && !/sms_message_id|column/i.test(error.message ?? "")) {
    console.error("[sms-delivery] patch sale notify failed", error.message);
  }
}
