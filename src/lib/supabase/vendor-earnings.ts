import "server-only";
import { createRandomId } from "@/lib/random-id";
import { splitSale } from "@/lib/commerce/commission";
import type {
  EarningStatus,
  PayoutBatch,
  VendorEarning,
  VendorEarningsSummary,
  VendorPayoutDueRow,
} from "@/lib/commerce/earnings-types";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import { getListingById } from "@/lib/store/db";
import type { CartOrder } from "@/lib/store/cart-orders";
import { getVendorByOwnerKey, getVendorPrivate } from "@/lib/supabase/vendors";

export type {
  EarningStatus,
  PayoutBatch,
  VendorEarning,
  VendorEarningsSummary,
  VendorPayoutDueRow,
};

interface EarningRow {
  id: string;
  owner_key: string;
  listing_id: string;
  cart_order_id: string;
  gross_thb: number;
  vendor_amount_thb: number;
  platform_amount_thb: number;
  vendor_share: number;
  platform_share: number;
  currency: string;
  status: EarningStatus;
  created_at: string;
  paid_out_at?: string | null;
  paid_out_by?: string | null;
  payout_batch_id?: string | null;
  payout_note?: string | null;
}

interface PayoutBatchRow {
  id: string;
  created_at: string;
  created_by: string;
  note: string | null;
  owner_keys: string[] | null;
  earning_ids: string[] | null;
  vendor_total_thb: number;
  line_count: number;
}

function rowToEarning(row: EarningRow): VendorEarning {
  return {
    id: row.id,
    ownerKey: row.owner_key,
    listingId: row.listing_id,
    cartOrderId: row.cart_order_id,
    grossThb: Number(row.gross_thb),
    vendorAmountThb: Number(row.vendor_amount_thb),
    platformAmountThb: Number(row.platform_amount_thb),
    vendorShare: Number(row.vendor_share),
    platformShare: Number(row.platform_share),
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
    paidOutAt: row.paid_out_at ?? undefined,
    paidOutBy: row.paid_out_by ?? undefined,
    payoutBatchId: row.payout_batch_id ?? undefined,
    payoutNote: row.payout_note ?? undefined,
  };
}

function rowToBatch(row: PayoutBatchRow): PayoutBatch {
  return {
    id: row.id,
    createdAt: row.created_at,
    createdBy: row.created_by,
    note: row.note ?? undefined,
    ownerKeys: row.owner_keys ?? [],
    earningIds: row.earning_ids ?? [],
    vendorTotalThb: Number(row.vendor_total_thb),
    lineCount: Number(row.line_count),
  };
}

/**
 * Record 70/30 commission lines for every vendor-owned item in a paid cart.
 * Idempotent via unique (cart_order_id, listing_id).
 */
export async function recordSaleCommissions(order: CartOrder): Promise<VendorEarning[]> {
  if (!isSupabaseConfigured() || order.status !== "paid") return [];

  const created: VendorEarning[] = [];

  for (const item of order.items) {
    const listing = await getListingById(item.listingId);
    const ownerKey = listing?.ownerId?.trim();
    if (!ownerKey) continue;

    const split = splitSale(item.price);
    const row = {
      id: createRandomId(),
      owner_key: ownerKey,
      listing_id: item.listingId,
      cart_order_id: order.id,
      gross_thb: split.grossThb,
      vendor_amount_thb: split.vendorAmountThb,
      platform_amount_thb: split.platformAmountThb,
      vendor_share: split.vendorShare,
      platform_share: split.platformShare,
      currency: order.currency || "THB",
      status: "available" as EarningStatus,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await getSupabaseAdmin()
      .from("vendor_earnings")
      .upsert(row, { onConflict: "cart_order_id,listing_id", ignoreDuplicates: true })
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("[vendor-earnings] upsert failed", error);
      continue;
    }
    if (data) created.push(rowToEarning(data as EarningRow));
  }

  return created;
}

export async function listVendorEarnings(
  ownerKey: string,
  limit = 50,
): Promise<VendorEarning[]> {
  if (!isSupabaseConfigured() || !ownerKey) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("vendor_earnings")
    .select("*")
    .eq("owner_key", ownerKey)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data as EarningRow[]) ?? []).map(rowToEarning);
}

export async function summarizeVendorEarnings(ownerKey: string): Promise<VendorEarningsSummary> {
  const recent = await listVendorEarnings(ownerKey, 200);
  const sum = (fn: (e: VendorEarning) => number) => recent.reduce((a, e) => a + fn(e), 0);
  return {
    salesCount: recent.length,
    grossThb: sum((e) => e.grossThb),
    vendorEarnedThb: sum((e) => e.vendorAmountThb),
    platformFeeThb: sum((e) => e.platformAmountThb),
    pendingThb: sum((e) => (e.status === "pending" ? e.vendorAmountThb : 0)),
    availableThb: sum((e) => (e.status === "available" ? e.vendorAmountThb : 0)),
    paidOutThb: sum((e) => (e.status === "paid_out" ? e.vendorAmountThb : 0)),
    recent: recent.slice(0, 40),
  };
}

/** Admin: list recent earnings across all vendors. */
export async function listAllEarnings(limit = 100): Promise<VendorEarning[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("vendor_earnings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data as EarningRow[]) ?? []).map(rowToEarning);
}

/** Admin: available balances grouped by vendor, with bank details. */
export async function listVendorsDueForPayout(): Promise<VendorPayoutDueRow[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("vendor_earnings")
    .select("*")
    .in("status", ["available", "paid_out"])
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw error;

  const rows = ((data as EarningRow[]) ?? []).map(rowToEarning);
  const byOwner = new Map<
    string,
    { available: VendorEarning[]; paidOutThb: number }
  >();

  for (const e of rows) {
    const bucket = byOwner.get(e.ownerKey) ?? { available: [], paidOutThb: 0 };
    if (e.status === "available") bucket.available.push(e);
    if (e.status === "paid_out") bucket.paidOutThb += e.vendorAmountThb;
    byOwner.set(e.ownerKey, bucket);
  }

  const result: VendorPayoutDueRow[] = [];
  for (const [ownerKey, bucket] of byOwner) {
    if (bucket.available.length === 0 && bucket.paidOutThb === 0) continue;
    const [profile, priv] = await Promise.all([
      getVendorByOwnerKey(ownerKey),
      getVendorPrivate(ownerKey),
    ]);
    const payout = priv?.payout ?? {};
    const availableThb = bucket.available.reduce((s, e) => s + e.vendorAmountThb, 0);
    result.push({
      ownerKey,
      displayName: profile?.displayName ?? null,
      contactEmail: profile?.contactEmail ?? null,
      availableThb,
      availableLineCount: bucket.available.length,
      paidOutThb: bucket.paidOutThb,
      bankName: payout.bankName,
      accountName: payout.accountName,
      accountNumber: payout.accountNumber,
      promptPay: payout.promptPay,
      hasBankDetails: Boolean(
        (payout.bankName && payout.accountName && payout.accountNumber) || payout.promptPay,
      ),
      earningIds: bucket.available.map((e) => e.id),
    });
  }

  return result.sort((a, b) => b.availableThb - a.availableThb);
}

export interface MarkPaidOutInput {
  adminEmail: string;
  /** Mark all available lines for these vendors. */
  ownerKeys?: string[];
  /** Or mark specific earning ids. */
  earningIds?: string[];
  note?: string;
}

export interface MarkPaidOutResult {
  batch: PayoutBatch;
  updatedCount: number;
  vendorTotalThb: number;
}

/** Flip available → paid_out and write a payout batch audit row. */
export async function markEarningsPaidOut(
  input: MarkPaidOutInput,
): Promise<MarkPaidOutResult> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const ownerKeys = (input.ownerKeys ?? []).map((k) => k.trim()).filter(Boolean);
  const earningIds = (input.earningIds ?? []).map((k) => k.trim()).filter(Boolean);
  if (ownerKeys.length === 0 && earningIds.length === 0) {
    throw new Error("ต้องระบุ ownerKeys หรือ earningIds");
  }

  let query = getSupabaseAdmin()
    .from("vendor_earnings")
    .select("*")
    .eq("status", "available");

  if (earningIds.length > 0) {
    query = query.in("id", earningIds);
  } else {
    query = query.in("owner_key", ownerKeys);
  }

  const { data: pendingRows, error: listErr } = await query;
  if (listErr) throw listErr;

  const lines = ((pendingRows as EarningRow[]) ?? []).map(rowToEarning);
  if (lines.length === 0) {
    throw new Error("ไม่พบรายการสถานะพร้อมโอนที่ตรงเงื่อนไข");
  }

  const batchId = createRandomId();
  const now = new Date().toISOString();
  const note = input.note?.trim() || undefined;
  const ids = lines.map((l) => l.id);
  const owners = Array.from(new Set(lines.map((l) => l.ownerKey)));
  const vendorTotalThb = lines.reduce((s, l) => s + l.vendorAmountThb, 0);

  const { error: updateErr } = await getSupabaseAdmin()
    .from("vendor_earnings")
    .update({
      status: "paid_out",
      paid_out_at: now,
      paid_out_by: input.adminEmail,
      payout_batch_id: batchId,
      payout_note: note ?? null,
    })
    .in("id", ids)
    .eq("status", "available");

  if (updateErr) throw updateErr;

  const batchRow = {
    id: batchId,
    created_at: now,
    created_by: input.adminEmail,
    note: note ?? null,
    owner_keys: owners,
    earning_ids: ids,
    vendor_total_thb: vendorTotalThb,
    line_count: ids.length,
  };

  const { data: batchData, error: batchErr } = await getSupabaseAdmin()
    .from("vendor_payout_batches")
    .insert(batchRow)
    .select("*")
    .single();

  if (batchErr) {
    console.error("[vendor-earnings] batch insert failed", batchErr);
    // Earnings already flipped — still return a synthetic batch for the response.
    return {
      batch: rowToBatch(batchRow as PayoutBatchRow),
      updatedCount: ids.length,
      vendorTotalThb,
    };
  }

  return {
    batch: rowToBatch(batchData as PayoutBatchRow),
    updatedCount: ids.length,
    vendorTotalThb,
  };
}

export async function listPayoutBatches(limit = 30): Promise<PayoutBatch[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("vendor_payout_batches")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    // Table may not exist yet on older envs.
    console.warn("[vendor-earnings] listPayoutBatches", error.message);
    return [];
  }
  return ((data as PayoutBatchRow[]) ?? []).map(rowToBatch);
}

/** CSV rows for vendors with available balance (and bank info). */
export function buildPayoutCsv(rows: VendorPayoutDueRow[]): string {
  const header = [
    "owner_key",
    "display_name",
    "contact_email",
    "available_thb",
    "available_lines",
    "paid_out_thb",
    "bank_name",
    "account_name",
    "account_number",
    "promptpay",
    "has_bank_details",
    "earning_ids",
  ];
  const escape = (v: string | number | boolean | null | undefined) => {
    const s = v == null ? "" : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = rows
    .filter((r) => r.availableThb > 0)
    .map((r) =>
      [
        r.ownerKey,
        r.displayName,
        r.contactEmail,
        r.availableThb,
        r.availableLineCount,
        r.paidOutThb,
        r.bankName,
        r.accountName,
        r.accountNumber,
        r.promptPay,
        r.hasBankDetails,
        r.earningIds.join("|"),
      ]
        .map(escape)
        .join(","),
    );
  return [header.join(","), ...lines].join("\n");
}
