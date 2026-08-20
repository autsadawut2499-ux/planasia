/** Shared supplier helpers safe for client + server. */

export type SupplierKind = "platform" | "custom";

export interface SupplierRef {
  kind: SupplierKind;
  slug?: string | null;
  name?: string;
}

/** Shopee / Lazada listings need a marketplace product URL. */
export function supplierNeedsProductUrl(supplier: SupplierRef | null | undefined): boolean {
  if (!supplier || supplier.kind !== "platform") return false;
  const slug = (supplier.slug ?? "").toLowerCase();
  if (slug === "shopee" || slug === "lazada") return true;
  const name = (supplier.name ?? "").trim().toLowerCase();
  return name === "shopee" || name === "lazada";
}

export function isFixedPlatformSupplier(supplier: Pick<SupplierRef, "kind"> | null | undefined): boolean {
  return supplier?.kind === "platform";
}
