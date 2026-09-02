"use client";

import { RotateCcw } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { parseAreaSqm } from "@/lib/format";
import { PROVINCES_BY_REGION } from "@/lib/geo/th-provinces";
import { COLLECTIONS, STYLES } from "@/lib/store/taxonomy";
import type { StoreListing } from "@/lib/store/db";

export interface StoreFiltersState {
  floors: 0 | 1 | 2;
  /** 0 = any; otherwise minimum bedrooms (4 = 4+) */
  beds: number;
  /** 0 = any; otherwise minimum bathrooms (3 = 3+) */
  baths: number;
  /** 0 = any; otherwise minimum living/reception rooms (2 = 2+) */
  livingRooms: number;
  /** 0 = any; 3 = 3+ parking spaces */
  parking: number;
  style: string;
  collection: string;
  province: string;
  /** Listing sale price floor (THB). 0 = any. */
  priceMin: number;
  /** Listing sale price ceiling (THB). 0 = any. */
  priceMax: number;
}

export const DEFAULT_STORE_FILTERS: StoreFiltersState = {
  floors: 0,
  beds: 0,
  baths: 0,
  livingRooms: 0,
  parking: 0,
  style: "",
  collection: "",
  province: "",
  priceMin: 0,
  priceMax: 0,
};

/** Plan sale-price presets (THB) for hard budget filter. */
export const PRICE_PRESETS: {
  id: string;
  min: number;
  max: number;
  labelTh: string;
  labelEn: string;
}[] = [
  { id: "any", min: 0, max: 0, labelTh: "ทั้งหมด", labelEn: "Any" },
  { id: "u5k", min: 0, max: 5000, labelTh: "ไม่เกิน ฿5,000", labelEn: "Up to ฿5,000" },
  { id: "5-15k", min: 5000, max: 15000, labelTh: "฿5,000–15,000", labelEn: "฿5,000–15,000" },
  { id: "15-30k", min: 15000, max: 30000, labelTh: "฿15,000–30,000", labelEn: "฿15,000–30,000" },
  { id: "30k+", min: 30000, max: 0, labelTh: "฿30,000 ขึ้นไป", labelEn: "฿30,000+" },
];

/** Area presets in m² (draftsman `area` field). */
export const AREA_PRESETS: { id: string; min: number; max: number; labelTh: string; labelEn: string }[] = [
  { id: "any", min: 0, max: 0, labelTh: "ทั้งหมด", labelEn: "Any" },
  { id: "u100", min: 0, max: 100, labelTh: "ไม่เกิน 100 ตร.ม.", labelEn: "Up to 100 m²" },
  { id: "100-150", min: 100, max: 150, labelTh: "100–150 ตร.ม.", labelEn: "100–150 m²" },
  { id: "150-200", min: 150, max: 200, labelTh: "150–200 ตร.ม.", labelEn: "150–200 m²" },
  { id: "200-300", min: 200, max: 300, labelTh: "200–300 ตร.ม.", labelEn: "200–300 m²" },
  { id: "300p", min: 300, max: 0, labelTh: "300 ตร.ม. ขึ้นไป", labelEn: "300 m²+" },
];

interface StoreFiltersProps {
  filters: StoreFiltersState;
  onChange: (updates: Partial<StoreFiltersState>) => void;
  areaRange: { min: number; max: number };
  onAreaChange: (range: { min: number; max: number }) => void;
  resultCount: number;
  /** Live catalog — used to show facet counts from draftsman data. */
  listings?: StoreListing[];
  onClear?: () => void;
}

/**
 * Framed search-filter sidebar for /store.
 * Options map to draftsman listing fields: style, collection, area, beds, baths, livingRooms, floors, parking.
 */
export function StoreFilters({
  filters,
  onChange,
  areaRange,
  onAreaChange,
  resultCount,
  listings = [],
  onClear,
}: StoreFiltersProps) {
  const { locale, translate } = useApp();
  const thai = locale === "th";

  const activeAreaId = useMemo(() => {
    const match = AREA_PRESETS.find(
      (p) => p.id !== "any" && p.min === areaRange.min && p.max === areaRange.max,
    );
    if (match) return match.id;
    if (!areaRange.min && !areaRange.max) return "any";
    return "";
  }, [areaRange]);

  const activePriceId = useMemo(() => {
    const match = PRICE_PRESETS.find(
      (p) =>
        p.id !== "any" && p.min === filters.priceMin && p.max === filters.priceMax,
    );
    if (match) return match.id;
    if (!filters.priceMin && !filters.priceMax) return "any";
    return "";
  }, [filters.priceMin, filters.priceMax]);

  const counts = useMemo(() => {
    const style = new Map<string, number>();
    const collection = new Map<string, number>();
    for (const item of listings) {
      if (item.style) style.set(item.style, (style.get(item.style) ?? 0) + 1);
      if (item.collection) collection.set(item.collection, (collection.get(item.collection) ?? 0) + 1);
    }
    return { style, collection };
  }, [listings]);

  const hasActive =
    filters.floors > 0 ||
    filters.beds > 0 ||
    filters.baths > 0 ||
    filters.livingRooms > 0 ||
    filters.parking > 0 ||
    !!filters.style ||
    !!filters.collection ||
    !!filters.province ||
    filters.priceMin > 0 ||
    filters.priceMax > 0 ||
    areaRange.min > 0 ||
    areaRange.max > 0;

  return (
    <aside className="store-filter-panel h-fit font-sans text-sm lg:sticky lg:top-[72px]">
      <div className="mb-5 flex items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#1e40af]">
            {translate("store.filters")}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            <span className="font-semibold text-text-primary">{resultCount}</span>{" "}
            {translate("store.results")}
          </p>
        </div>
        {hasActive && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-[#1e40af] hover:bg-[#1e40af]/5"
          >
            <RotateCcw className="h-3 w-3" />
            {thai ? "ล้าง" : "Clear"}
          </button>
        )}
      </div>

      <div className="space-y-6">
        <FilterGroup
          label={thai ? "สไตล์สถาปัตย์" : translate("store.filterStyle")}
          hint={thai ? "จากข้อมูลที่นักออกแบบกรอก" : "From draftsman listing data"}
        >
          <ChipList
            value={filters.style}
            options={[
              { id: "", label: translate("store.any") },
              ...STYLES.map((s) => ({
                id: s.id,
                label: thai ? s.th : s.en,
                count: counts.style.get(s.id),
              })),
            ]}
            onChange={(style) => onChange({ style })}
          />
        </FilterGroup>

        <FilterGroup
          label={thai ? "ประเภทแบบบ้าน" : translate("store.filterCollection")}
          hint={thai ? "ชั้นเดียว / สองชั้น / ขนาดเล็ก ฯลฯ" : "Plan type / collection"}
        >
          <ChipList
            value={filters.collection}
            options={[
              { id: "", label: translate("store.any") },
              ...COLLECTIONS.map((c) => ({
                id: c.id,
                label: thai ? c.th : c.en,
                count: counts.collection.get(c.id),
              })),
            ]}
            onChange={(collection) => onChange({ collection })}
          />
        </FilterGroup>

        <FilterGroup
          label={thai ? "ช่วงราคาแบบบ้าน" : "Plan price"}
          hint={thai ? "ราคาขายไฟล์แบบ (Hard filter)" : "Listing sale price (hard filter)"}
        >
          <div className="space-y-1.5">
            {PRICE_PRESETS.map((preset) => {
              const selected = activePriceId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() =>
                    onChange({ priceMin: preset.min, priceMax: preset.max })
                  }
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-[12px] transition ${
                    selected
                      ? "border-[#1e40af] bg-[#1e40af]/5 font-semibold text-[#1e40af]"
                      : "border-border bg-white text-text-secondary hover:border-[#1e40af]/35"
                  }`}
                >
                  <span>{thai ? preset.labelTh : preset.labelEn}</span>
                  {selected && <span className="h-1.5 w-1.5 rounded-full bg-[#1e40af]" />}
                </button>
              );
            })}
          </div>
        </FilterGroup>

        <FilterGroup
          label={thai ? "พื้นที่ใช้สอย" : "Usable area"}
          hint={thai ? "ตร.ม. ตามข้อมูลแบบบ้าน" : "Square metres from listing area"}
        >
          <div className="space-y-1.5">
            {AREA_PRESETS.map((preset) => {
              const selected = activeAreaId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onAreaChange({ min: preset.min, max: preset.max })}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-[12px] transition ${
                    selected
                      ? "border-[#1e40af] bg-[#1e40af]/5 font-semibold text-[#1e40af]"
                      : "border-border bg-white text-text-secondary hover:border-[#1e40af]/35"
                  }`}
                >
                  <span>{thai ? preset.labelTh : preset.labelEn}</span>
                  {selected && <span className="h-1.5 w-1.5 rounded-full bg-[#1e40af]" />}
                </button>
              );
            })}
          </div>
        </FilterGroup>

        <FilterGroup
          label={translate("store.filterBeds")}
          hint={thai ? "จำนวนห้องนอนขั้นต่ำ" : "Minimum bedrooms"}
        >
          <Segmented
            options={[0, 1, 2, 3, 4].map((n) => ({
              value: n,
              label: n === 0 ? translate("store.any") : n === 4 ? "4+" : String(n),
            }))}
            value={filters.beds}
            onChange={(beds) => onChange({ beds })}
          />
        </FilterGroup>

        <FilterGroup
          label={translate("store.filterBaths")}
          hint={thai ? "จำนวนห้องน้ำขั้นต่ำ" : "Minimum bathrooms"}
        >
          <Segmented
            options={[0, 1, 2, 3].map((n) => ({
              value: n,
              label: n === 0 ? translate("store.any") : n === 3 ? "3+" : String(n),
            }))}
            value={filters.baths}
            onChange={(baths) => onChange({ baths })}
          />
        </FilterGroup>

        <FilterGroup
          label={translate("store.filterLivingRooms")}
          hint={thai ? "จำนวนห้องรับแขกขั้นต่ำ" : "Minimum living / reception rooms"}
        >
          <Segmented
            options={[0, 1, 2].map((n) => ({
              value: n,
              label: n === 0 ? translate("store.any") : n === 2 ? "2+" : String(n),
            }))}
            value={filters.livingRooms}
            onChange={(livingRooms) => onChange({ livingRooms })}
          />
        </FilterGroup>

        <FilterGroup label={translate("store.filterFloors")}>
          <Segmented
            options={[
              { value: 0, label: translate("store.any") },
              { value: 1, label: thai ? "1 ชั้น" : "1" },
              { value: 2, label: thai ? "2 ชั้น" : "2" },
            ]}
            value={filters.floors}
            onChange={(v) => onChange({ floors: v as 0 | 1 | 2 })}
          />
        </FilterGroup>

        <FilterGroup
          label={thai ? "ที่จอดรถ" : "Garage / parking"}
          hint={thai ? "จำนวนคัน ตามที่นักออกแบบระบุ" : "Vehicle spaces from listing"}
        >
          <Segmented
            options={[0, 1, 2, 3].map((n) => ({
              value: n,
              label: n === 0 ? translate("store.any") : n === 3 ? "3+" : String(n),
            }))}
            value={filters.parking}
            onChange={(parking) => onChange({ parking })}
          />
        </FilterGroup>

        <FilterGroup label={translate("store.filterProvince")}>
          <select
            value={filters.province}
            onChange={(e) => onChange({ province: e.target.value })}
            className="w-full rounded-lg border border-border bg-white px-3 py-2.5 text-[13px] text-text-primary outline-none focus:border-[#1e40af] focus:ring-1 focus:ring-[#1e40af]/30"
          >
            <option value="">{translate("store.any")}</option>
            {PROVINCES_BY_REGION.map((group) => (
              <optgroup key={group.region} label={group.label}>
                {group.provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {thai ? p.th : p.en}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </FilterGroup>
      </div>
    </aside>
  );
}

/** Shared filter predicate used by the store grid (Hard Constraints). */
export function listingMatchesStoreFilters(
  item: StoreListing,
  filters: StoreFiltersState,
  areaRange: { min: number; max: number },
): boolean {
  if (filters.floors && item.floors !== filters.floors) return false;

  // Minimum beds / baths / living rooms
  if (filters.beds && item.beds < filters.beds) return false;
  if (filters.baths && item.baths < filters.baths) return false;
  if (filters.livingRooms) {
    const living = item.livingRooms ?? 0;
    if (living < filters.livingRooms) return false;
  }

  if (filters.parking) {
    const parking = item.parking ?? 0;
    if (filters.parking >= 3) {
      if (parking < 3) return false;
    } else if (parking !== filters.parking) {
      return false;
    }
  }

  const itemStyle = (item.style ?? "").trim().toLowerCase();
  const filterStyle = filters.style.trim().toLowerCase();
  if (filterStyle && itemStyle !== filterStyle) return false;

  const itemCollection = (item.collection ?? "").trim().toLowerCase();
  const filterCollection = filters.collection.trim().toLowerCase();
  if (filterCollection && itemCollection !== filterCollection) return false;

  const itemProvince = (item.province ?? "").trim().toLowerCase();
  const filterProvince = filters.province.trim().toLowerCase();
  if (filterProvince && itemProvince !== filterProvince) return false;

  // Spec: price <= max (and optional min floor)
  if (filters.priceMin && item.price < filters.priceMin) return false;
  if (filters.priceMax && item.price > filters.priceMax) return false;

  if (areaRange.min || areaRange.max) {
    const area = parseAreaSqm(item.area);
    if (area == null) return false;
    if (areaRange.min && area < areaRange.min) return false;
    if (areaRange.max && area > areaRange.max) return false;
  }

  return true;
}

function ChipList({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string; count?: number }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto pr-0.5">
      {options.map((opt) => {
        const selected = value === opt.id;
        const hideEmpty = opt.id !== "" && opt.count === 0;
        if (hideEmpty) return null;
        return (
          <button
            key={opt.id || "any"}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
              selected
                ? "border-[#1e40af] bg-[#1e40af] text-white"
                : "border-border bg-white text-text-secondary hover:border-[#1e40af]/40 hover:text-[#1e40af]"
            }`}
          >
            {opt.label}
            {opt.id && typeof opt.count === "number" && opt.count > 0 && (
              <span className={selected ? "text-white/80" : "text-text-muted"}>({opt.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function FilterGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#1e3a5f]">{label}</p>
      {hint && <p className="mt-0.5 mb-2 text-[10px] text-text-muted">{hint}</p>}
      {!hint && <div className="mb-2" />}
      {children}
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: number; label: string }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`min-h-8 min-w-[2.25rem] rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
            value === opt.value
              ? "border-[#1e40af] bg-[#1e40af] text-white"
              : "border-border bg-white text-text-secondary hover:border-[#1e40af]/40"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
