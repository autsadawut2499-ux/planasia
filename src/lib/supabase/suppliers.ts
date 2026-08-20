import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/client";
import {
  isFixedPlatformSupplier,
  supplierNeedsProductUrl,
  type SupplierKind,
} from "@/lib/store/supplier-platform";

export type { SupplierKind };
export { isFixedPlatformSupplier, supplierNeedsProductUrl };

export interface Supplier {
  id: string;
  name: string;
  kind: SupplierKind;
  slug?: string;
  createdAt: string;
  updatedAt: string;
}

interface SupplierRow {
  id: string;
  name: string;
  kind: SupplierKind | null;
  slug: string | null;
  created_at: string;
  updated_at: string;
}

function rowToSupplier(row: SupplierRow): Supplier {
  const kind: SupplierKind = row.kind === "platform" ? "platform" : "custom";
  return {
    id: row.id,
    name: row.name,
    kind,
    slug: row.slug ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

export async function listSuppliers(): Promise<Supplier[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("suppliers")
    .select("id, name, kind, slug, created_at, updated_at")
    .order("kind", { ascending: false })
    .order("name", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as SupplierRow[]).map(rowToSupplier);
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("suppliers")
    .select("id, name, kind, slug, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToSupplier(data as SupplierRow) : null;
}

export async function createSupplier(nameRaw: string): Promise<Supplier> {
  const name = normalizeName(nameRaw);
  if (name.length < 1 || name.length > 120) {
    throw new Error("ชื่อซัพพลายเออร์ต้องยาว 1–120 ตัวอักษร");
  }
  const blocked = ["shopee", "lazada"];
  if (blocked.includes(name.toLowerCase())) {
    throw new Error("Shopee และ Lazada เป็นแพลตฟอร์มหลักในระบบอยู่แล้ว");
  }

  const { data, error } = await getSupabaseAdmin()
    .from("suppliers")
    .insert({
      name,
      kind: "custom",
      updated_at: new Date().toISOString(),
    })
    .select("id, name, kind, slug, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("มีซัพพลายเออร์ชื่อนี้อยู่แล้ว");
    }
    throw error;
  }
  return rowToSupplier(data as SupplierRow);
}

export async function updateSupplier(id: string, nameRaw: string): Promise<Supplier> {
  const existing = await getSupplierById(id);
  if (!existing) throw new Error("ไม่พบซัพพลายเออร์");
  if (isFixedPlatformSupplier(existing)) {
    throw new Error("แก้ไขชื่อแพลตฟอร์มหลัก (Shopee / Lazada) ไม่ได้");
  }

  const name = normalizeName(nameRaw);
  if (name.length < 1 || name.length > 120) {
    throw new Error("ชื่อซัพพลายเออร์ต้องยาว 1–120 ตัวอักษร");
  }
  if (["shopee", "lazada"].includes(name.toLowerCase())) {
    throw new Error("ไม่สามารถใช้ชื่อ Shopee หรือ Lazada สำหรับซัพพลายเออร์ทั่วไป");
  }

  const { data, error } = await getSupabaseAdmin()
    .from("suppliers")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("kind", "custom")
    .select("id, name, kind, slug, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("มีซัพพลายเออร์ชื่อนี้อยู่แล้ว");
    }
    throw error;
  }

  await getSupabaseAdmin()
    .from("store_listings")
    .update({ supplier_name: name })
    .eq("supplier_id", id);

  return rowToSupplier(data as SupplierRow);
}

export async function deleteSupplier(id: string): Promise<void> {
  const existing = await getSupplierById(id);
  if (!existing) throw new Error("ไม่พบซัพพลายเออร์");
  if (isFixedPlatformSupplier(existing)) {
    throw new Error("ลบแพลตฟอร์มหลัก (Shopee / Lazada) ไม่ได้");
  }

  const { count, error: countError } = await getSupabaseAdmin()
    .from("store_listings")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", id);
  if (countError) throw countError;
  if ((count ?? 0) > 0) {
    throw new Error(
      `ลบไม่ได้ — มีแบบบ้าน ${count} รายการผูกกับซัพพลายเออร์นี้อยู่ (เปลี่ยนหรือล้างก่อน)`,
    );
  }

  const { error } = await getSupabaseAdmin()
    .from("suppliers")
    .delete()
    .eq("id", id)
    .eq("kind", "custom");
  if (error) throw error;
}

export async function countListingsForSupplier(id: string): Promise<number> {
  const { count, error } = await getSupabaseAdmin()
    .from("store_listings")
    .select("id", { count: "exact", head: true })
    .eq("supplier_id", id);
  if (error) throw error;
  return count ?? 0;
}
