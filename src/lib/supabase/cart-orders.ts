import type { CartOrder } from "@/lib/store/cart-orders";
import { isUpsellAddonId } from "@/lib/store/cart-pricing";
import type { DocumentLanguage } from "@/lib/store/document-languages";
import { isDocumentLanguage } from "@/lib/store/document-languages";
import {
  normalizeShippingAddress,
  type ShippingAddress,
} from "@/lib/store/shipping-address";
import {
  normalizeSitePlanInfo,
  type SitePlanInfo,
} from "@/lib/store/site-plan-info";
import { getSupabaseAdmin } from "@/lib/supabase/client";

interface CartOrderRow {
  id: string;
  items: CartOrder["items"];
  addons: CartOrder["addons"];
  subtotal: number;
  discount: number;
  addon_total: number;
  language_surcharge?: number | null;
  total: number;
  currency: string;
  buyer_user_id: string | null;
  buyer_name?: string | null;
  buyer_email?: string | null;
  buyer_phone?: string | null;
  document_language?: string | null;
  target_country?: string | null;
  translation_status?: string | null;
  translation_result?: Record<string, unknown> | null;
  shipping_address?: ShippingAddress | null;
  site_plan_info?: SitePlanInfo | null;
  stripe_session_id: string | null;
  confirmation_email_sent_at?: string | null;
  payment_method?: string | null;
  slip_image_path?: string | null;
  slip_verify_status?: string | null;
  slip_verify_payload?: Record<string, unknown> | null;
  slip_verified_at?: string | null;
  payment_failure_reason?: string | null;
  order_summary_pdf_path?: string | null;
  status: CartOrder["status"];
  created_at: string;
}

function rowToOrder(row: CartOrderRow): CartOrder {
  const lang = row.document_language;
  const rawAddons = Array.isArray(row.addons) ? row.addons : [];
  const shipping = row.shipping_address
    ? normalizeShippingAddress(row.shipping_address)
    : undefined;
  return {
    id: row.id,
    items: row.items,
    addons: rawAddons.filter(isUpsellAddonId),
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    addonTotal: Number(row.addon_total),
    languageSurcharge: Number(row.language_surcharge ?? 0),
    total: Number(row.total),
    currency: row.currency,
    buyerUserId: row.buyer_user_id ?? undefined,
    buyerName: row.buyer_name ?? undefined,
    buyerEmail: row.buyer_email ?? undefined,
    buyerPhone: row.buyer_phone ?? undefined,
    documentLanguage: isDocumentLanguage(lang) ? lang : undefined,
    targetCountry: row.target_country ?? undefined,
    translationStatus: (row.translation_status as CartOrder["translationStatus"]) ?? undefined,
    translationResult: row.translation_result ?? undefined,
    shippingAddress: shipping,
    sitePlanInfo: row.site_plan_info
      ? normalizeSitePlanInfo(row.site_plan_info)
      : undefined,
    stripeSessionId: row.stripe_session_id ?? undefined,
    confirmationEmailSentAt: row.confirmation_email_sent_at ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
    slipImagePath: row.slip_image_path ?? undefined,
    slipVerifyStatus: (row.slip_verify_status as CartOrder["slipVerifyStatus"]) ?? undefined,
    slipVerifyPayload: row.slip_verify_payload ?? undefined,
    slipVerifiedAt: row.slip_verified_at ?? undefined,
    paymentFailureReason: row.payment_failure_reason ?? undefined,
    orderSummaryPdfPath: row.order_summary_pdf_path ?? undefined,
    status: normalizeOrderStatus(row.status),
    createdAt: row.created_at,
  };
}

function normalizeOrderStatus(raw: string): CartOrder["status"] {
  if (raw === "paid" || raw === "failed" || raw === "awaiting_payment" || raw === "pending") {
    return raw;
  }
  return "awaiting_payment";
}

function orderToRow(order: CartOrder): CartOrderRow {
  return {
    id: order.id,
    items: order.items,
    addons: order.addons,
    subtotal: order.subtotal,
    discount: order.discount,
    addon_total: order.addonTotal,
    language_surcharge: order.languageSurcharge ?? 0,
    total: order.total,
    currency: order.currency,
    buyer_user_id: order.buyerUserId ?? null,
    buyer_name: order.buyerName ?? null,
    buyer_email: order.buyerEmail ?? null,
    buyer_phone: order.buyerPhone ?? null,
    document_language: order.documentLanguage ?? null,
    target_country: order.targetCountry ?? null,
    translation_status: order.translationStatus ?? (order.targetCountry ? "pending" : null),
    translation_result: order.translationResult ?? null,
    shipping_address: order.shippingAddress
      ? normalizeShippingAddress(order.shippingAddress)
      : null,
    site_plan_info: order.sitePlanInfo
      ? normalizeSitePlanInfo(order.sitePlanInfo)
      : null,
    stripe_session_id: order.stripeSessionId ?? null,
    payment_method: order.paymentMethod ?? null,
    slip_image_path: order.slipImagePath ?? null,
    slip_verify_status: order.slipVerifyStatus ?? null,
    slip_verify_payload: order.slipVerifyPayload ?? null,
    slip_verified_at: order.slipVerifiedAt ?? null,
    payment_failure_reason: order.paymentFailureReason ?? null,
    order_summary_pdf_path: order.orderSummaryPdfPath ?? null,
    // Omit confirmation_email_sent_at unless explicitly set — avoid wiping the claim on upsert.
    ...(order.confirmationEmailSentAt
      ? { confirmation_email_sent_at: order.confirmationEmailSentAt }
      : {}),
    status: order.status === "pending" ? "awaiting_payment" : order.status,
    created_at: order.createdAt,
  } as CartOrderRow;
}

function orderToCompatRow(order: CartOrder): Record<string, unknown> {
  const full = orderToRow(order) as unknown as Record<string, unknown>;
  return full;
}

function stripMissingColumns(
  row: Record<string, unknown>,
  errorMessage: string,
): Record<string, unknown> {
  const next = { ...row };
  const msg = errorMessage.toLowerCase();
  for (const col of [
    "buyer_name",
    "buyer_email",
    "buyer_phone",
    "document_language",
    "language_surcharge",
    "shipping_address",
    "site_plan_info",
    "target_country",
    "translation_status",
    "translation_result",
    "confirmation_email_sent_at",
    "payment_method",
    "slip_image_path",
    "slip_verify_status",
    "slip_verify_payload",
    "slip_verified_at",
    "payment_failure_reason",
    "order_summary_pdf_path",
  ]) {
    if (msg.includes(col)) delete next[col];
  }
  return next;
}

/**
 * Atomically claim the right to send the buyer confirmation email.
 * Returns false if another worker already claimed (or already sent).
 */
export async function claimCartOrderConfirmationEmail(
  orderId: string,
): Promise<boolean> {
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from("cart_orders")
    .update({ confirmation_email_sent_at: now })
    .eq("id", orderId)
    .is("confirmation_email_sent_at", null)
    .select("id")
    .maybeSingle();
  if (error) {
    // Column may not exist on older DBs — allow send (best-effort).
    if ((error.message ?? "").toLowerCase().includes("confirmation_email_sent_at")) {
      console.warn("[cart-orders] confirmation_email_sent_at missing — skipping dedupe");
      return true;
    }
    console.error("[cart-orders] claim confirmation email failed", error);
    return false;
  }
  return Boolean(data?.id);
}

/** Release claim so a failed send can be retried on the next fulfill pass. */
export async function releaseCartOrderConfirmationEmail(
  orderId: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("cart_orders")
    .update({ confirmation_email_sent_at: null })
    .eq("id", orderId);
  if (error && !(error.message ?? "").toLowerCase().includes("confirmation_email_sent_at")) {
    console.error("[cart-orders] release confirmation email failed", error);
  }
}

export async function saveCartOrder(order: CartOrder): Promise<CartOrder> {
  let row: Record<string, unknown> = orderToCompatRow(order);

  for (let attempt = 0; attempt < 5; attempt++) {
    const result = await getSupabaseAdmin()
      .from("cart_orders")
      .upsert(row, { onConflict: "id" })
      .select("*")
      .single();
    if (!result.error) return rowToOrder(result.data as CartOrderRow);

    const stripped = stripMissingColumns(row, result.error.message ?? "");
    if (JSON.stringify(stripped) === JSON.stringify(row)) throw result.error;
    row = stripped;
  }

  throw new Error("Failed to save cart order");
}

export async function getCartOrder(id: string): Promise<CartOrder | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("cart_orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data as CartOrderRow) : null;
}

export async function markCartOrderPaid(
  id: string,
  stripeSessionId?: string,
): Promise<CartOrder | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("cart_orders")
    .update({
      status: "paid",
      stripe_session_id: stripeSessionId ?? null,
      payment_failure_reason: null,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data as CartOrderRow) : null;
}

export async function markCartOrderFailed(
  id: string,
  reason: string,
  patch?: {
    slipImagePath?: string;
    slipVerifyPayload?: Record<string, unknown>;
  },
): Promise<CartOrder | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("cart_orders")
    .update({
      status: "failed",
      slip_verify_status: "invalid",
      payment_failure_reason: reason.slice(0, 500),
      ...(patch?.slipImagePath ? { slip_image_path: patch.slipImagePath } : {}),
      ...(patch?.slipVerifyPayload
        ? { slip_verify_payload: patch.slipVerifyPayload }
        : {}),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data as CartOrderRow) : null;
}

export async function updateCartOrderSlip(
  id: string,
  patch: {
    slipImagePath?: string;
    slipVerifyStatus?: CartOrder["slipVerifyStatus"];
    slipVerifyPayload?: Record<string, unknown> | null;
    slipVerifiedAt?: string | null;
    paymentFailureReason?: string | null;
    status?: CartOrder["status"];
    paymentRef?: string;
  },
): Promise<CartOrder | null> {
  const row: Record<string, unknown> = {};
  if (patch.slipImagePath !== undefined) row.slip_image_path = patch.slipImagePath;
  if (patch.slipVerifyStatus !== undefined) row.slip_verify_status = patch.slipVerifyStatus;
  if (patch.slipVerifyPayload !== undefined) {
    row.slip_verify_payload = patch.slipVerifyPayload;
  }
  if (patch.slipVerifiedAt !== undefined) row.slip_verified_at = patch.slipVerifiedAt;
  if (patch.paymentFailureReason !== undefined) {
    row.payment_failure_reason = patch.paymentFailureReason;
  }
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.paymentRef !== undefined) row.stripe_session_id = patch.paymentRef;

  const { data, error } = await getSupabaseAdmin()
    .from("cart_orders")
    .update(row)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data as CartOrderRow) : null;
}

export async function findCartOrderByStripeSession(
  sessionId: string,
): Promise<CartOrder | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("cart_orders")
    .select("*")
    .eq("stripe_session_id", sessionId)
    .eq("status", "paid")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data as CartOrderRow) : null;
}

export async function updateCartOrderSummaryPdf(
  id: string,
  orderSummaryPdfPath: string,
): Promise<CartOrder | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("cart_orders")
    .update({ order_summary_pdf_path: orderSummaryPdfPath })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToOrder(data as CartOrderRow) : null;
}

export async function listCartOrders(opts?: {
  status?: CartOrder["status"];
  limit?: number;
}): Promise<CartOrder[]> {
  let q = getSupabaseAdmin()
    .from("cart_orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(opts?.limit ?? 100, 1), 500));
  if (opts?.status) {
    q = q.eq("status", opts.status);
  }
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((row) => rowToOrder(row as CartOrderRow));
}

export type { DocumentLanguage };
