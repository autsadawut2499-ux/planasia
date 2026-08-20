/** Site plan (แผนผังบริเวณ) details collected at checkout when site-plan addon is selected. */

export interface SitePlanInfo {
  /** Province id from TH_PROVINCES (e.g. "bangkok"). */
  provinceId: string;
  /** Thai province display name. */
  provinceName: string;
  /** District id from th-districts-by-province.json. */
  districtId: string;
  /** Thai district / amphoe display name. */
  districtName: string;
  /** Land title deed number (เลขโฉนดที่ดิน). */
  landTitleDeedNumber: string;
}

export const EMPTY_SITE_PLAN_INFO: SitePlanInfo = {
  provinceId: "",
  provinceName: "",
  districtId: "",
  districtName: "",
  landTitleDeedNumber: "",
};

export function normalizeSitePlanInfo(
  input: Partial<SitePlanInfo> | null | undefined,
): SitePlanInfo {
  return {
    provinceId: String(input?.provinceId ?? "").trim(),
    provinceName: String(input?.provinceName ?? "").trim(),
    districtId: String(input?.districtId ?? "").trim(),
    districtName: String(input?.districtName ?? "").trim(),
    landTitleDeedNumber: String(input?.landTitleDeedNumber ?? "")
      .trim()
      .slice(0, 80),
  };
}

export function isSitePlanInfoComplete(
  info: SitePlanInfo | null | undefined,
): boolean {
  if (!info) return false;
  const a = normalizeSitePlanInfo(info);
  return (
    a.provinceId.length > 0 &&
    a.provinceName.length > 0 &&
    a.districtId.length > 0 &&
    a.districtName.length > 0 &&
    a.landTitleDeedNumber.length >= 2
  );
}
