import { randomBytes } from "crypto";
import type { UpsellAddonId } from "@/lib/store/cart-pricing";
import {
  findCartOrderByStripeSession as supabaseFindCartOrderByStripeSession,
  getCartOrder as supabaseGetCartOrder,
  markCartOrderPaid as supabaseMarkCartOrderPaid,
  saveCartOrder as supabaseSaveCartOrder,
} from "@/lib/supabase/cart-orders";

export interface CartOrderItem {
  listingId: string;
  planId: string;
  name: string;
  price: number;
}

export interface CartOrder {
  id: string;
  items: CartOrderItem[];
  addons: UpsellAddonId[];
  subtotal: number;
  discount: number;
  addonTotal: number;
  total: number;
  currency: string;
  buyerUserId?: string;
  stripeSessionId?: string;
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
