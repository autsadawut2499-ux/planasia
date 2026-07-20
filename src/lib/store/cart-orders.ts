import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import type { UpsellAddonId } from "@/lib/store/cart-pricing";

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

const ORDERS_FILE = path.join(process.cwd(), "data", "cart-orders.json");

async function loadOrders(): Promise<CartOrder[]> {
  try {
    const raw = await readFile(ORDERS_FILE, "utf-8");
    return JSON.parse(raw) as CartOrder[];
  } catch {
    return [];
  }
}

async function saveOrders(orders: CartOrder[]): Promise<void> {
  await mkdir(path.dirname(ORDERS_FILE), { recursive: true });
  await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf-8");
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
