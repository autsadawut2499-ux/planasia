/** Physical hardcopy delivery address collected at checkout. */
export interface ShippingAddress {
  fullName: string;
  phone: string;
  /** Street / house number only (single address line). */
  line1: string;
  /**
   * @deprecated No longer collected at checkout. Kept for reading legacy orders.
   */
  line2?: string;
  /** อำเภอ / เขต (district / amphoe). */
  district: string;
  /** ตำบล / แขวง (sub-district / tambon). */
  subDistrict: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export const EMPTY_SHIPPING_ADDRESS: ShippingAddress = {
  fullName: "",
  phone: "",
  line1: "",
  district: "",
  subDistrict: "",
  province: "",
  postalCode: "",
  notes: "",
};

export function normalizeShippingAddress(
  input: Partial<ShippingAddress> | null | undefined,
): ShippingAddress {
  const hasExplicitSubDistrict =
    input != null &&
    Object.prototype.hasOwnProperty.call(input, "subDistrict");
  const rawDistrict = String(input?.district ?? "").trim();
  const rawSubDistrict = String(input?.subDistrict ?? "").trim();

  // Legacy orders only had `district` labeled as แขวง/ตำบล (no amphoe field).
  // Map that value into subDistrict when the new key was never stored.
  let district = rawDistrict;
  let subDistrict = rawSubDistrict;
  if (!hasExplicitSubDistrict && rawDistrict && !rawSubDistrict) {
    subDistrict = rawDistrict;
    district = "";
  }

  return {
    fullName: String(input?.fullName ?? "").trim(),
    phone: String(input?.phone ?? "").trim(),
    line1: String(input?.line1 ?? "").trim(),
    line2: String(input?.line2 ?? "").trim() || undefined,
    district,
    subDistrict,
    province: String(input?.province ?? "").trim(),
    postalCode: String(input?.postalCode ?? "").trim(),
    notes: String(input?.notes ?? "").trim() || undefined,
  };
}

export function isShippingAddressComplete(
  address: ShippingAddress | null | undefined,
): boolean {
  if (!address) return false;
  const a = normalizeShippingAddress(address);
  const phoneDigits = a.phone.replace(/[^\d+]/g, "");
  return (
    a.fullName.length >= 2 &&
    phoneDigits.length >= 9 &&
    a.line1.length >= 5 &&
    a.subDistrict.length >= 2 &&
    a.district.length >= 2 &&
    a.province.length >= 2 &&
    /^\d{5}$/.test(a.postalCode)
  );
}
