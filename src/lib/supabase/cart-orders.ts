import type { CartOrder } from "@/lib/store/cart-orders";
import { getSupabaseAdmin } from "@/lib/supabase/client";

interface CartOrderRow {
  id: string;
  items: CartOrder["items"];
  addons: CartOrder["addons"];
  subtotal: number;
  discount: number;
  addon_total: number;
  total: number;
  currency: string;
  buyer_user_id: string | null;
  stripe_session_id: string | null;
  status: CartOrder["status"];
  created_at: string;
}

function rowToOrder(row: CartOrderRow): CartOrder {
  return {
    id: row.id,
    items: row.items,
    addons: row.addons,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    addonTotal: Number(row.addon_total),
    total: Number(row.total),
    currency: row.currency,
    buyerUserId: row.buyer_user_id ?? undefined,
    stripeSessionId: row.stripe_session_id ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

function orderToRow(order: CartOrder): CartOrderRow {
  return {
    id: order.id,
    items: order.items,
    addons: order.addons,
    subtotal: order.subtotal,
    discount: order.discount,
    addon_total: order.addonTotal,
    total: order.total,
    currency: order.currency,
    buyer_user_id: order.buyerUserId ?? null,
    stripe_session_id: order.stripeSessionId ?? null,
    status: order.status,
    created_at: order.createdAt,
  };
}

export async function saveCartOrder(order: CartOrder): Promise<CartOrder> {
  const { data, error } = await getSupabaseAdmin()
    .from("cart_orders")
    .upsert(orderToRow(order), { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return rowToOrder(data as CartOrderRow);
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
    })
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
