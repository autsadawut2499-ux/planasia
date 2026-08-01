/** Physical hardcopy delivery address collected at checkout. */
export interface ShippingAddress {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  district: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export const EMPTY_SHIPPING_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  district: "",
  province: "",
  postalCode: "",
  notes: "",
};

export function normalizeShippingAddress(
  input: Partial<ShippingAddress> | null | undefined,
): ShippingAddress {
  return {
    fullName: String(input?.fullName ?? "").trim(),
    phone: String(input?.phone ?? "").trim(),
    line1: String(input?.line1 ?? "").trim(),
    line2: String(input?.line2 ?? "").trim() || undefined,
    district: String(input?.district ?? "").trim(),
    province: String(input?.province ?? "").trim(),
    postalCode: String(input?.postalCode ?? "").trim(),
    notes: String(input?.notes ?? "").trim() || undefined,
  };
}

export function isShippingAddressComplete(address: ShippingAddress | null | undefined): boolean {
  if (!address) return false;
  const a = normalizeShippingAddress(address);
  const phoneDigits = a.phone.replace(/[^\d+]/g, "");
  return (
    a.fullName.length >= 2 &&
    phoneDigits.length >= 9 &&
    a.line1.length >= 5 &&
    a.district.length >= 2 &&
    a.province.length >= 2 &&
    /^\d{5}$/.test(a.postalCode)
  );
}
