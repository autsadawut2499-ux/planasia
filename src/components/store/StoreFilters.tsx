"use client";

import { useApp } from "@/context/AppContext";
import { HOUSE_STYLES } from "@/lib/geo/countries";

export interface StoreFiltersState {
  floors: 0 | 1 | 2;
  beds: number;
  baths: number;
  style: string;
}

interface StoreFiltersProps {
  filters: StoreFiltersState;
  onChange: (updates: Partial<StoreFiltersState>) => void;
  resultCount: number;
}

export function StoreFilters({ filters, onChange, resultCount }: StoreFiltersProps) {
  const { locale, translate } = useApp();

  return (
    <aside className="store-filter-panel sticky top-[88px] h-fit space-y-5">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-text-secondary">
          {translate("store.filters")}
        </p>
        <p className="text-sm text-text-muted">
          {resultCount} {translate("store.results")}
        </p>
      </div>

      <FilterGroup label={translate("store.filterFloors")}>
        <Segmented
          options={[
            { value: 0, label: translate("store.any") },
            { value: 1, label: "1" },
            { value: 2, label: "2" },
          ]}
          value={filters.floors}
          onChange={(v) => onChange({ floors: v as 0 | 1 | 2 })}
        />
      </FilterGroup>

      <FilterGroup label={translate("store.filterBeds")}>
        <Segmented
          options={[0, 1, 2, 3, 4].map((n) => ({
            value: n,
            label: n === 0 ? translate("store.any") : String(n),
          }))}
          value={filters.beds}
          onChange={(v) => onChange({ beds: v })}
        />
      </FilterGroup>

      <FilterGroup label={translate("store.filterBaths")}>
        <Segmented
          options={[0, 1, 2, 3].map((n) => ({
            value: n,
            label: n === 0 ? translate("store.any") : String(n),
          }))}
          value={filters.baths}
          onChange={(v) => onChange({ baths: v })}
        />
      </FilterGroup>

      <FilterGroup label={translate("store.filterStyle")}>
        <div className="space-y-1.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="style"
              checked={filters.style === ""}
              onChange={() => onChange({ style: "" })}
              className="accent-[#1e40af]"
            />
            {translate("store.any")}
          </label>
          {HOUSE_STYLES.slice(0, 6).map((s) => (
            <label key={s.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="style"
                checked={filters.style === s.id}
                onChange={() => onChange({ style: s.id })}
                className="accent-[#1e40af]"
              />
              {s.label[locale] ?? s.label.en}
            </label>
          ))}
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-secondary">{label}</p>
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
    <div className="flex flex-wrap gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`min-w-[2rem] rounded border px-2.5 py-1.5 text-xs font-medium transition-colors ${
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
