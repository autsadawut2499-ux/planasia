import "server-only";

import { createRandomId } from "@/lib/random-id";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export type NotifyChannelStatus = "pending" | "sent" | "skipped" | "failed";

export interface SaleNotifyLogRow {
  id: string;
  cartOrderId: string;
  ownerKey: string;
  listingIds: string[];
  planCodes: string[];
  phoneE164: string | null;
  smsStatus: NotifyChannelStatus;
  pushStatus: NotifyChannelStatus;
  emailStatus: NotifyChannelStatus;
}

/**
 * Claim a per-order / per-designer notification slot.
 * Returns null when this owner was already notified for this order (idempotent).
 */
export async function claimSaleNotification(input: {
  cartOrderId: string;
  ownerKey: string;
  listingIds: string[];
  planCodes: string[];
  phoneE164: string | null;
}): Promise<SaleNotifyLogRow | null> {
  const claimed: SaleNotifyLogRow = {
    id: createRandomId(),
    cartOrderId: input.cartOrderId,
    ownerKey: input.ownerKey,
    listingIds: input.listingIds,
    planCodes: input.planCodes,
    phoneE164: input.phoneE164,
    smsStatus: "pending",
    pushStatus: "pending",
    emailStatus: "pending",
  };

  if (!isSupabaseConfigured()) return claimed;

  const row = {
    id: claimed.id,
    cart_order_id: input.cartOrderId,
    owner_key: input.ownerKey,
    listing_ids: input.listingIds,
    plan_codes: input.planCodes,
    phone_e164: input.phoneE164,
    sms_status: "pending",
    push_status: "pending",
    email_status: "pending",
    created_at: new Date().toISOString(),
  };

  const { error } = await getSupabaseAdmin()
    .from("vendor_sale_notifications")
    .insert(row);

  if (!error) return claimed;

  const msg = (error.message ?? "").toLowerCase();
  const code = String((error as { code?: string }).code ?? "");
  // Unique violation → already claimed on a prior fulfill attempt.
  if (code === "23505" || msg.includes("duplicate") || msg.includes("unique")) {
    return null;
  }

  console.error("[sale-notify] claim failed", error);
  // Fail open so a log glitch does not silence alerts.
  return claimed;
}

export async function updateSaleNotificationChannels(
  id: string,
  patch: {
    phoneE164?: string | null;
    smsStatus?: NotifyChannelStatus;
    smsError?: string | null;
    pushStatus?: NotifyChannelStatus;
    emailStatus?: NotifyChannelStatus;
  },
): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  const row: Record<string, unknown> = {};
  if (patch.phoneE164 !== undefined) row.phone_e164 = patch.phoneE164;
  if (patch.smsStatus) row.sms_status = patch.smsStatus;
  if (patch.smsError !== undefined) row.sms_error = patch.smsError;
  if (patch.pushStatus) row.push_status = patch.pushStatus;
  if (patch.emailStatus) row.email_status = patch.emailStatus;
  if (Object.keys(row).length === 0) return;

  const { error } = await getSupabaseAdmin()
    .from("vendor_sale_notifications")
    .update(row)
    .eq("id", id);
  if (error) console.error("[sale-notify] update failed", error);
}
