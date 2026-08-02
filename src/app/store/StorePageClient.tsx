"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import {
  DEFAULT_STORE_FILTERS,
  StoreFilters,
  listingMatchesStoreFilters,
  type StoreFiltersState,
} from "@/components/store/StoreFilters";
import { StorePlanCard } from "@/components/store/StorePlanCard";
import { StoreUpsellSection } from "@/components/store/StoreUpsellSection";
import { RecommendedForYou } from "@/components/store/RecommendedForYou";
import { useApp } from "@/context/AppContext";
import { listingMatchesSearch, useStoreBrowse } from "@/context/StoreBrowseContext";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import type { StoreListing } from "@/lib/store/db";

interface StorePageClientProps {
  initialListings?: StoreListing[];
}

function StorePageContent({ initialListings = [] }: StorePageClientProps) {
  const searchParams = useSearchParams();
  const { translate } = useApp();
  const { searchQuery, setSearchQuery, showFavoritesOnly, setShowFavoritesOnly, isFavorite } =
    useStoreBrowse();
  const viewer = useStoreViewer();

  const [listings, setListings] = useState<StoreListing[]>(initialListings);
  const [filters, setFilters] = useState<StoreFiltersState>(DEFAULT_STORE_FILTERS);
  const [areaRange, setAreaRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [loading, setLoading] = useState(initialListings.length === 0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hasSsrData = initialListings.length > 0;

  // Apply filters coming from the home hero search / nav
  // (e.g. /store?areaMin=100&areaMax=250&beds=3&baths=2&style=modern). Areas are in m².
  useEffect(() => {
    const beds = Number(searchParams.get("beds"));
    const baths = Number(searchParams.get("baths"));
    const floors = Number(searchParams.get("floors"));
    const parking = Number(searchParams.get("parking"));
    const areaMin = Number(searchParams.get("areaMin"));
    const areaMax = Number(searchParams.get("areaMax"));
    const style = searchParams.get("style") ?? "";
    const collection = searchParams.get("collection") ?? "";
    const province = searchParams.get("province") ?? "";
    const search = searchParams.get("search");
    setFilters((f) => ({
      ...f,
      beds: Number.isFinite(beds) && beds > 0 ? beds : f.beds,
      baths: Number.isFinite(baths) && baths > 0 ? baths : f.baths,
      floors: floors === 1 || floors === 2 ? floors : f.floors,
      parking: Number.isFinite(parking) && parking > 0 ? parking : f.parking,
      style: style || f.style,
      collection: collection || f.collection,
      province: province || f.province,
    }));
    setAreaRange({
      min: Number.isFinite(areaMin) && areaMin > 0 ? areaMin : 0,
      max: Number.isFinite(areaMax) && areaMax > 0 ? areaMax : 0,
    });
    if (search) setSearchQuery(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadListings = useCallback(async () => {
    if (!viewer.ready) return;
    // Soft refresh when SSR already painted cards — avoid skeleton flicker.
    if (!hasSsrData) setLoading(true);
    try {
      const res = await fetch("/api/store", {
        headers: viewer.headers(),
        cache: "no-store",
      });
      const data = await res.json();
      setListings(data.listings ?? []);
    } finally {
      setLoading(false);
    }
  }, [viewer, hasSsrData]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  // Re-sync when the tab regains focus so admin Approve / new uploads appear quickly.
  useEffect(() => {
    const onFocus = () => {
      void loadListings();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadListings]);

  const filtered = useMemo(() => {
    return listings.filter((item) => {
      if (!listingMatchesSearch(item, searchQuery)) return false;
      if (showFavoritesOnly && !isFavorite(item.id)) return false;
      return listingMatchesStoreFilters(item, filters, areaRange);
    });
  }, [listings, filters, areaRange, searchQuery, showFavoritesOnly, isFavorite]);

  const clearFilters = () => {
    setFilters(DEFAULT_STORE_FILTERS);
    setAreaRange({ min: 0, max: 0 });
  };

  return (
    <>
      <LandingHeader />
      <main className="page-canvas min-h-screen font-sans">
        <div className="border-b border-border/70 bg-[var(--color-card,#fff)] px-5 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-[1200px]">
            <h1 className="text-lg font-semibold text-[#1e3a5f] md:text-xl">
              {translate("store.pageTitle")}
            </h1>
            <p className="mt-1 text-xs text-text-secondary md:text-sm">{translate("store.subtitle")}</p>
            {(searchQuery || showFavoritesOnly) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {searchQuery && (
                  <span className="rounded-full bg-surface-raised px-2.5 py-0.5 text-[11px] text-text-secondary">
                    {translate("store.searchActive")}: &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
                {showFavoritesOnly && (
                  <button
                    type="button"
                    onClick={() => setShowFavoritesOnly(false)}
                    className="rounded-full bg-[#1e40af]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#1e40af]"
                  >
                    {translate("store.favoritesFilterActive")} ×
                  </button>
                )}
              </div>
            )}
            <p className="mt-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] leading-relaxed text-blue-900 md:text-xs">
              {translate("store.autoListingNote")}
            </p>
          </div>
        </div>

        <RecommendedForYou
          className="border-b border-border/70 py-12 md:py-14"
          filters={{
            beds: filters.beds,
            baths: filters.baths,
            floors: filters.floors,
            style: filters.style,
            areaMin: areaRange.min,
            areaMax: areaRange.max,
          }}
          limit={8}
        />

        <div className="mx-auto grid w-full max-w-[1200px] gap-6 px-4 py-8 sm:gap-8 sm:px-6 md:px-8 md:py-12 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-8">
          {/* Desktop / tablet landscape sidebar */}
          <div className="hidden min-w-0 lg:block">
            <StoreFilters
              filters={filters}
              onChange={(u) => setFilters((f) => ({ ...f, ...u }))}
              areaRange={areaRange}
              onAreaChange={setAreaRange}
              resultCount={filtered.length}
              listings={listings}
              onClear={clearFilters}
            />
          </div>

          <div className="min-w-0 w-full">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-[var(--color-card,#fff)] px-4 py-2.5 text-sm font-semibold text-text-primary shadow-sm lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4 text-[#1e40af]" />
                {translate("store.filters")}
                <span className="rounded-full bg-[#1e40af]/10 px-2 py-0.5 text-xs text-[#1e40af]">
                  {filtered.length}
                </span>
              </button>
              <p className="hidden text-sm text-text-muted sm:block lg:ml-auto">
                {filtered.length} {translate("store.results")}
              </p>
            </div>

            {loading ? (
              <div className="store-card-grid">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="store-card h-80 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-[var(--color-card,#fff)] py-24 text-center">
                <p className="text-text-muted">{translate("store.empty")}</p>
              </div>
            ) : (
              <>
                <div className="store-card-grid">
                  {filtered.map((item, i) => (
                    <StorePlanCard key={item.id} item={item} index={i} />
                  ))}
                </div>

                <StoreUpsellSection
                  listings={listings}
                  variant="full"
                  className="mt-12 rounded-xl border border-border bg-[var(--color-card,#fff)] p-4 sm:p-6"
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile / tablet filter bottom sheet (ABHP-style filters off-canvas) */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label={translate("nav.closeMenu")}
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-base font-bold text-text-primary">{translate("store.filters")}</p>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="flex min-h-10 min-w-10 items-center justify-center rounded-full hover:bg-surface-raised"
                aria-label={translate("nav.closeMenu")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              <StoreFilters
                filters={filters}
                onChange={(u) => setFilters((f) => ({ ...f, ...u }))}
                areaRange={areaRange}
                onAreaChange={setAreaRange}
                resultCount={filtered.length}
                listings={listings}
                onClear={clearFilters}
              />
            </div>
            <div className="border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="w-full min-h-12 rounded-lg bg-[#1e40af] text-sm font-semibold uppercase tracking-wide text-white"
              >
                {filtered.length} {translate("store.results")}
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default function StorePageClient({ initialListings = [] }: StorePageClientProps) {
  return <StorePageContent initialListings={initialListings} />;
}
