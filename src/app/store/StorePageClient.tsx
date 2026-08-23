"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
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
import { filtersToHardConstraints } from "@/lib/search/intent";
import { searchHousePlans } from "@/lib/search/house-search";
import { STORE_GRID_PAGE_SIZE } from "@/lib/store/catalogue-columns";
import type { StoreListing } from "@/lib/store/db";

interface StorePageClientProps {
  initialListings?: StoreListing[];
}

const FOCUS_REFRESH_MIN_MS = 60_000;

function StorePageContent({ initialListings = [] }: StorePageClientProps) {
  const searchParams = useSearchParams();
  const { translate, locale } = useApp();
  const { searchQuery, setSearchQuery, showFavoritesOnly, setShowFavoritesOnly, isFavorite } =
    useStoreBrowse();
  const viewer = useStoreViewer();

  const [listings, setListings] = useState<StoreListing[]>(initialListings);
  const [filters, setFilters] = useState<StoreFiltersState>(DEFAULT_STORE_FILTERS);
  const [areaRange, setAreaRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [loading, setLoading] = useState(initialListings.length === 0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const hasSsrData = initialListings.length > 0;
  const lastFetchAt = useRef(hasSsrData ? Date.now() : 0);

  // Apply filters coming from the home hero search / nav
  // (e.g. /store?areaMin=100&areaMax=250&beds=3&baths=2&style=modern). Areas are in m².
  useEffect(() => {
    const beds = Number(searchParams.get("beds"));
    const baths = Number(searchParams.get("baths"));
    const livingRooms = Number(searchParams.get("livingRooms"));
    const floors = Number(searchParams.get("floors"));
    const parking = Number(searchParams.get("parking"));
    const areaMin = Number(searchParams.get("areaMin"));
    const areaMax = Number(searchParams.get("areaMax"));
    const style = searchParams.get("style") ?? "";
    const collection = searchParams.get("collection") ?? "";
    const province = searchParams.get("province") ?? "";
    const priceMin = Number(searchParams.get("priceMin"));
    const priceMax = Number(searchParams.get("priceMax"));
    const search = searchParams.get("search");
    setFilters((f) => ({
      ...f,
      beds: Number.isFinite(beds) && beds > 0 ? beds : f.beds,
      baths: Number.isFinite(baths) && baths > 0 ? baths : f.baths,
      livingRooms:
        Number.isFinite(livingRooms) && livingRooms > 0 ? livingRooms : f.livingRooms,
      floors: floors === 1 || floors === 2 ? floors : f.floors,
      parking: Number.isFinite(parking) && parking > 0 ? parking : f.parking,
      style: style || f.style,
      collection: collection || f.collection,
      province: province || f.province,
      priceMin: Number.isFinite(priceMin) && priceMin > 0 ? priceMin : f.priceMin,
      priceMax: Number.isFinite(priceMax) && priceMax > 0 ? priceMax : f.priceMax,
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
      lastFetchAt.current = Date.now();
    } finally {
      setLoading(false);
    }
  }, [viewer, hasSsrData]);

  // Skip the immediate client refetch when SSR already delivered the catalogue.
  useEffect(() => {
    if (hasSsrData) return;
    void loadListings();
  }, [hasSsrData, loadListings]);

  // Re-sync on focus at most once per minute (admin Approve / new uploads).
  useEffect(() => {
    const onFocus = () => {
      if (Date.now() - lastFetchAt.current < FOCUS_REFRESH_MIN_MS) return;
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

  /** Near-match fallback when hard filters wipe the grid (Guardrails). */
  const nearMatch = useMemo(() => {
    if (filtered.length > 0 || showFavoritesOnly) return null;
    const hasHard =
      filters.beds > 0 ||
      filters.baths > 0 ||
      filters.livingRooms > 0 ||
      filters.floors > 0 ||
      filters.priceMin > 0 ||
      filters.priceMax > 0 ||
      areaRange.min > 0 ||
      areaRange.max > 0;
    if (!hasHard && !filters.style && !filters.collection) return null;

    const hard = filtersToHardConstraints({
      beds: filters.beds || undefined,
      baths: filters.baths || undefined,
      livingRooms: filters.livingRooms || undefined,
      floors: filters.floors || undefined,
      priceMin: filters.priceMin || undefined,
      priceMax: filters.priceMax || undefined,
      areaMin: areaRange.min || undefined,
      areaMax: areaRange.max || undefined,
    });
    const result = searchHousePlans(listings, {
      hard,
      soft: {
        styleTags: filters.style ? [filters.style] : undefined,
        siteConstraints:
          filters.collection === "small" ? ["narrow-lot", "small-footprint"] : undefined,
        keywords: searchQuery.trim() ? [searchQuery.trim()] : undefined,
      },
      limit: 8,
    });
    if (!result.usedFallback || result.hits.length === 0) return null;
    return result;
  }, [filtered.length, listings, filters, areaRange, searchQuery, showFavoritesOnly]);

  // Reset to first page whenever the active filter/search set changes.
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, areaRange, searchQuery, showFavoritesOnly]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filtered.length / STORE_GRID_PAGE_SIZE)),
    [filtered],
  );
  const visible = useMemo(
    () =>
      filtered.slice(
        (currentPage - 1) * STORE_GRID_PAGE_SIZE,
        currentPage * STORE_GRID_PAGE_SIZE,
      ),
    [filtered, currentPage],
  );
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

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
          </div>
        </div>

        <RecommendedForYou
          className="border-b border-border/70 py-10 md:py-12"
          filters={{
            beds: filters.beds,
            baths: filters.baths,
            livingRooms: filters.livingRooms,
            floors: filters.floors,
            style: filters.style,
            areaMin: areaRange.min,
            areaMax: areaRange.max,
            priceMin: filters.priceMin,
            priceMax: filters.priceMax,
          }}
          limit={8}
        />

        <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-8 sm:gap-8 sm:px-5 md:px-6 md:py-12 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-6 xl:gap-7">
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
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="store-card h-72 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="space-y-6">
                <div className="rounded-xl border border-dashed border-border bg-[var(--color-card,#fff)] px-6 py-10 text-center">
                  <p className="text-text-muted">{translate("store.empty")}</p>
                  {nearMatch?.fallbackMessage && (
                    <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#1e3a5f]">
                      {locale === "th"
                        ? nearMatch.fallbackMessage.th
                        : nearMatch.fallbackMessage.en}
                    </p>
                  )}
                </div>
                {nearMatch && nearMatch.hits.length > 0 && (
                  <div>
                    <h2 className="mb-4 text-sm font-semibold text-[#1e3a5f]">
                      {locale === "th"
                        ? "แบบบ้านที่ใกล้เคียงที่สุด"
                        : "Closest matching plans"}
                    </h2>
                    <div className="store-card-grid">
                      {nearMatch.hits.map((hit, i) => (
                        <StorePlanCard
                          key={hit.listing.id}
                          item={hit.listing}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="store-card-grid">
                  {visible.map((item, i) => (
                    <StorePlanCard key={item.id} item={item} index={i} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!hasPrev}
                      aria-label={locale === "th" ? "หน้าก่อนหน้า" : "Previous page"}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-white text-[#1e3a5f] shadow-sm transition hover:border-[#1e40af]/40 hover:text-[#1e40af] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="min-w-[120px] text-center text-sm font-semibold text-[#1e3a5f]">
                      {locale === "th"
                        ? `หน้า ${currentPage} จาก ${totalPages}`
                        : `Page ${currentPage} of ${totalPages}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={!hasNext}
                      aria-label={locale === "th" ? "หน้าถัดไป" : "Next page"}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-white text-[#1e3a5f] shadow-sm transition hover:border-[#1e40af]/40 hover:text-[#1e40af] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}

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
