/**
 * Thai administrative divisions for checkout / address forms.
 *
 * District (อำเภอ / เขต) data is generated from the standard nationwide
 * dataset **kongvut/thai-province-data**:
 *   https://github.com/kongvut/thai-province-data
 *   api/latest/province.json + district.json
 *
 * Regenerate with: `node scripts/generate-th-districts.cjs`
 *
 * Coverage: all 77 provinces × amphoes (and Bangkok khets), Thai + English names.
 */

import { TH_PROVINCES, type Province } from "@/lib/geo/th-provinces";
import districtsByProvince from "@/lib/geo/th-districts-by-province.json";

export type ThaiDistrict = {
  /** Official id from thai-province-data (district.json). */
  id: string;
  /** Thai name (อำเภอ / เขต) — preferred for UI and land documents. */
  th: string;
  en: string;
};

const DISTRICTS = districtsByProvince as Record<string, ThaiDistrict[]>;

const PROVINCES_SORTED_TH = [...TH_PROVINCES].sort((a, b) =>
  a.th.localeCompare(b.th, "th"),
);

/** All 77 provinces, sorted by Thai name (dropdown-friendly). */
export function listThaiProvinces(): Province[] {
  return PROVINCES_SORTED_TH;
}

export function getThaiProvinceById(id: string): Province | undefined {
  return TH_PROVINCES.find((p) => p.id === id);
}

/** All amphoes / Bangkok khets for a province id, already sorted in Thai. */
export function listDistrictsForProvince(provinceId: string): ThaiDistrict[] {
  if (!provinceId) return [];
  return DISTRICTS[provinceId] ?? [];
}

export function getDistrictForProvince(
  provinceId: string,
  districtId: string,
): ThaiDistrict | undefined {
  return listDistrictsForProvince(provinceId).find((d) => d.id === districtId);
}
