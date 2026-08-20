import { randomBytes } from "crypto";
import type { CartItemBase, UpsellAddonId } from "@/lib/store/cart-pricing";
import type { DocumentLanguage } from "@/lib/store/document-languages";
import type { ShippingAddress } from "@/lib/store/shipping-address";
import type { SitePlanInfo } from "@/lib/store/site-plan-info";
import {
  claimCartOrderConfirmationEmail as supabaseClaimCartOrderConfirmationEmail,
  findCartOrderByStripeSession as supabaseFindCartOrderByStripeSession,
  getCartOrder as supabaseGetCartOrder,
  listCartOrders as supabaseListCartOrders,
  markCartOrderFailed as supabaseMarkCartOrderFailed,
  markCartOrderPaid as supabaseMarkCartOrderPaid,
  releaseCartOrderConfirmationEmail as supabaseReleaseCartOrderConfirmationEmail,
  saveCartOrder as supabaseSaveCartOrder,
  updateCartOrderSlip as supabaseUpdateCartOrderSlip,
  updateCartOrderSummaryPdf as supabaseUpdateCartOrderSummaryPdf,
} from "@/lib/supabase/cart-orders";

export type CartOrderItem = CartItemBase;
export type { ShippingAddress };

export interface CartOrder {
  id: string;
  items: CartOrderItem[];
  addons: UpsellAddonId[];
  subtotal: number;
  discount: number;
  addonTotal: number;
  /** Document localization surcharge (THB). */
  languageSurcharge?: number;
  total: number;
  currency: string;
  buyerUserId?: string;
  buyerName?: string;
  buyerEmail?: string;
  /** Optional mobile for SMS receipt / download delivery. */
  buyerPhone?: string;
  documentLanguage?: DocumentLanguage;
  /**
   * Buyer-selected Gemini market country (TH, PH, …).
   * Translation + unit conversion run only after payment succeeds.
   */
  targetCountry?: string;
  translationStatus?: "pending" | "processing" | "completed" | "failed" | "skipped";
  translationResult?: Record<string, unknown>;
  /** Present when hardcopy-3sets addon is selected. */
  shippingAddress?: ShippingAddress;
  /** Present when site-plan addon is selected. */
  sitePlanInfo?: SitePlanInfo;
  stripeSessionId?: string;
  /** ISO timestamp when Resend confirmation email was claimed/sent. */
  confirmationEmailSentAt?: string;
  /** bank_transfer (current) — legacy stripe sessions may still exist. */
  paymentMethod?: "bank_transfer" | string;
  slipImagePath?: string;
  slipVerifyStatus?: "pending" | "verified" | "invalid" | "error";
  slipVerifyPayload?: Record<string, unknown>;
  slipVerifiedAt?: string;
  paymentFailureReason?: string;
  /** Private storage path of auto-generated order summary PDF. */
  orderSummaryPdfPath?: string;
  status: "pending" | "awaiting_payment" | "paid" | "failed";
  createdAt: string;
}

export function createCartOrderId(): string {
  return `cart_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

export async function saveCartOrder(order: CartOrder): Promise<CartOrder> {
  return supabaseSaveCartOrder(order);
}

export async function getCartOrder(id: string): Promise<CartOrder | null> {
  return supabaseGetCartOrder(id);
}

export async function markCartOrderPaid(
  id: string,
  stripeSessionId?: string,
): Promise<CartOrder | null> {
  return supabaseMarkCartOrderPaid(id, stripeSessionId);
}

export async function markCartOrderFailed(
  id: string,
  reason: string,
  patch?: {
    slipImagePath?: string;
    slipVerifyPayload?: Record<string, unknown>;
  },
): Promise<CartOrder | null> {
  return supabaseMarkCartOrderFailed(id, reason, patch);
}

export async function updateCartOrderSlip(
  id: string,
  patch: Parameters<typeof supabaseUpdateCartOrderSlip>[1],
): Promise<CartOrder | null> {
  return supabaseUpdateCartOrderSlip(id, patch);
}

export async function findCartOrderByStripeSession(
  sessionId: string,
): Promise<CartOrder | null> {
  return supabaseFindCartOrderByStripeSession(sessionId);
}

export async function claimCartOrderConfirmationEmail(
  orderId: string,
): Promise<boolean> {
  return supabaseClaimCartOrderConfirmationEmail(orderId);
}

export async function releaseCartOrderConfirmationEmail(
  orderId: string,
): Promise<void> {
  return supabaseReleaseCartOrderConfirmationEmail(orderId);
}

export async function updateCartOrderSummaryPdf(
  id: string,
  orderSummaryPdfPath: string,
): Promise<CartOrder | null> {
  return supabaseUpdateCartOrderSummaryPdf(id, orderSummaryPdfPath);
}

export async function listCartOrders(opts?: {
  status?: CartOrder["status"];
  limit?: number;
}): Promise<CartOrder[]> {
  return supabaseListCartOrders(opts);
}
