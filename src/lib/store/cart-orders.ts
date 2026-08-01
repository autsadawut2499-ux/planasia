import { randomBytes } from "crypto";
import type { CartItemBase, UpsellAddonId } from "@/lib/store/cart-pricing";
import type { DocumentLanguage } from "@/lib/store/document-languages";
import type { ShippingAddress } from "@/lib/store/shipping-address";
import {
  claimCartOrderConfirmationEmail as supabaseClaimCartOrderConfirmationEmail,
  findCartOrderByStripeSession as supabaseFindCartOrderByStripeSession,
  getCartOrder as supabaseGetCartOrder,
  markCartOrderPaid as supabaseMarkCartOrderPaid,
  releaseCartOrderConfirmationEmail as supabaseReleaseCartOrderConfirmationEmail,
  saveCartOrder as supabaseSaveCartOrder,
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
  stripeSessionId?: string;
  /** ISO timestamp when Resend confirmation email was claimed/sent. */
  confirmationEmailSentAt?: string;
  status: "pending" | "paid";
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
