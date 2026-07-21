import { randomBytes } from "crypto";
import type { UpsellAddonId } from "@/lib/store/cart-pricing";
import { readJsonBlob, writeJsonBlob } from "@/lib/storage/runtime";

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

const ORDERS_FILE = "cart-orders.json";

async function loadOrders(): Promise<CartOrder[]> {
  return readJsonBlob<CartOrder[]>(ORDERS_FILE, []);
}

async function saveOrders(orders: CartOrder[]): Promise<void> {
  await writeJsonBlob(ORDERS_FILE, orders);
}

export function createCartOrderId(): string {
  return `cart_${Date.now()}_${randomBytes(4).toString("hex")}`;
}

export async function saveCartOrder(order: CartOrder): Promise<CartOrder> {
  const orders = await loadOrders();
  orders.unshift(order);
  await saveOrders(orders);
  return order;
}

export async function getCartOrder(id: string): Promise<CartOrder | null> {
  const orders = await loadOrders();
  return orders.find((o) => o.id === id) ?? null;
}

export async function markCartOrderPaid(id: string, stripeSessionId?: string): Promise<CartOrder | null> {
  const orders = await loadOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  orders[idx] = { ...orders[idx], status: "paid", stripeSessionId };
  await saveOrders(orders);
  return orders[idx];
}

export async function findCartOrderByStripeSession(sessionId: string): Promise<CartOrder | null> {
  const orders = await loadOrders();
  return orders.find((o) => o.stripeSessionId === sessionId && o.status === "paid") ?? null;
}
