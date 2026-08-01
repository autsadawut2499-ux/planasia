import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export type WebhookEventStatus = "received" | "fulfilled" | "ignored" | "failed";

export interface PaymentWebhookEventInput {
  eventId: string;
  provider?: string;
  eventType: string;
  stripeSessionId?: string;
  cartOrderId?: string;
  planIds?: string[];
  amountTotal?: number | null;
  currency?: string | null;
  status?: WebhookEventStatus;
  payload?: unknown;
  errorMessage?: string;
}

/**
 * Persist a payment-provider webhook for audit + idempotency.
 * Returns false when this event_id was already recorded (safe to skip work).
 */
export async function beginWebhookEvent(input: PaymentWebhookEventInput): Promise<{
  isNew: boolean;
}> {
  if (!isSupabaseConfigured()) return { isNew: true };

  const row = {
    event_id: input.eventId,
    provider: input.provider ?? "stripe",
    event_type: input.eventType,
    stripe_session_id: input.stripeSessionId ?? null,
    cart_order_id: input.cartOrderId ?? null,
    plan_ids: input.planIds ?? [],
    amount_total: input.amountTotal ?? null,
    currency: input.currency ?? null,
    status: input.status ?? "received",
    payload: input.payload ?? null,
    error_message: input.errorMessage ?? null,
  };

  const { error } = await getSupabaseAdmin()
    .from("payment_webhook_events")
    .insert(row);

  if (error) {
    // Unique violation → Stripe (or us) retried; treat as already handled.
    if (error.code === "23505") return { isNew: false };
    console.error("[payment-webhook] insert failed", error);
    // Still attempt fulfillment — better to double-check than drop a paid order.
    return { isNew: true };
  }
  return { isNew: true };
}

export async function completeWebhookEvent(
  eventId: string,
  update: {
    status: WebhookEventStatus;
    planIds?: string[];
    cartOrderId?: string;
    errorMessage?: string;
  },
): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await getSupabaseAdmin()
    .from("payment_webhook_events")
    .update({
      status: update.status,
      plan_ids: update.planIds,
      cart_order_id: update.cartOrderId,
      error_message: update.errorMessage ?? null,
      processed_at: new Date().toISOString(),
    })
    .eq("event_id", eventId);

  if (error) console.error("[payment-webhook] complete failed", error);
}
