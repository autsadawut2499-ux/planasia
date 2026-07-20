"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StoreGlobalLanguageBanner } from "@/components/store/StoreGlobalLanguageBanner";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreFilters, type StoreFiltersState } from "@/components/store/StoreFilters";
import { StorePlanCard } from "@/components/store/StorePlanCard";
import { StoreCheckoutModal } from "@/components/store/StoreQuickView";
import { StoreUpsellSection } from "@/components/store/StoreUpsellSection";
import { useApp } from "@/context/AppContext";
import { useStoreCart } from "@/context/StoreCartContext";
import { listingMatchesSearch, useStoreBrowse } from "@/context/StoreBrowseContext";
import { useToast } from "@/context/ToastContext";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import { listingStorePath } from "@/lib/seo/slug";
import type { StoreListing } from "@/lib/store/db";

const DEFAULT_FILTERS: StoreFiltersState = {
  floors: 0,
  beds: 0,
  baths: 0,
  style: "",
};

function StorePageContent() {
  const router = useRouter();
  const { translate } = useApp();
  const { success: toastSuccess } = useToast();
  const { addItem, isInCart } = useStoreCart();
  const { searchQuery, showFavoritesOnly, setShowFavoritesOnly, isFavorite } = useStoreBrowse();
  const viewer = useStoreViewer();

  const [listings, setListings] = useState<StoreListing[]>([]);
  const [filters, setFilters] = useState<StoreFiltersState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [checkout, setCheckout] = useState<StoreListing | null>(null);

  const loadListings = useCallback(async () => {
    if (!viewer.ready) return;
    setLoading(true);
    try {
      const res = await fetch("/api/store", { headers: viewer.headers() });
      const data = await res.json();
      setListings(data.listings ?? []);
    } finally {
      setLoading(false);
    }
  }, [viewer]);

  useEffect(() => {
    void loadListings();
  }, [loadListings]);

  const filtered = useMemo(() => {
    return listings.filter((item) => {
      if (!listingMatchesSearch(item, searchQuery)) return false;
      if (showFavoritesOnly && !isFavorite(item.id)) return false;
      if (filters.floors && item.floors !== filters.floors) return false;
      if (filters.beds && item.beds !== filters.beds) return false;
      if (filters.baths && item.baths !== filters.baths) return false;
      if (filters.style && item.style !== filters.style) return false;
      return true;
    });
  }, [listings, filters, searchQuery, showFavoritesOnly, isFavorite]);

  const handlePurchaseSuccess = (downloadToken: string) => {
    setCheckout(null);
    toastSuccess(translate("store.purchaseSuccess"));
    window.open(`/api/download?token=${downloadToken}&format=pdf`, "_blank");
  };

  const handleAddToCart = (listing: StoreListing) => {
    addItem(listing);
    toastSuccess(translate("store.cartAdded"));
  };

  return (
    <>
      <StoreHeader />
      <StoreGlobalLanguageBanner />
      <main className="min-h-screen bg-[#f5f6f8]">
        <div className="border-b border-border bg-white px-4 py-6 md:px-6">
          <div className="mx-auto max-w-[1400px]">
            <h1 className="text-2xl font-bold text-[#1e3a5f] md:text-3xl">
              {translate("store.pageTitle")}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">{translate("store.subtitle")}</p>
            {(searchQuery || showFavoritesOnly) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {searchQuery && (
                  <span className="rounded-full bg-surface-raised px-3 py-1 text-xs text-text-secondary">
                    {translate("store.searchActive")}: &ldquo;{searchQuery}&rdquo;
                  </span>
                )}
                {showFavoritesOnly && (
                  <button
                    type="button"
                    onClick={() => setShowFavoritesOnly(false)}
                    className="rounded-full bg-[#1e40af]/10 px-3 py-1 text-xs font-medium text-[#1e40af]"
                  >
                    {translate("store.favoritesFilterActive")} ×
                  </button>
                )}
              </div>
            )}
            <p className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs text-blue-900">
              {translate("store.autoListingNote")}
            </p>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 md:px-6 lg:grid-cols-[260px_1fr]">
          <StoreFilters
            filters={filters}
            onChange={(u) => setFilters((f) => ({ ...f, ...u }))}
            resultCount={filtered.length}
          />

          <div>
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {translate("store.disclaimer")}
            </p>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="store-card h-80 animate-pulse bg-white" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-white py-20 text-center">
                <p className="text-text-muted">{translate("store.empty")}</p>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((item, i) => (
                    <StorePlanCard
                      key={item.id}
                      item={item}
                      index={i}
                      onQuickView={() => router.push(listingStorePath(item.slug))}
                      onBuy={() => setCheckout(item)}
                      onAddToCart={() => handleAddToCart(item)}
                      inCart={isInCart(item.id)}
                    />
                  ))}
                </div>

                <StoreUpsellSection
                  listings={listings}
                  variant="full"
                  className="mt-10 rounded-xl border border-border bg-white p-5"
                />
              </>
            )}
          </div>
        </div>
      </main>

      {checkout && (
        <StoreCheckoutModal
          listing={checkout}
          open
          onClose={() => setCheckout(null)}
          onSuccess={handlePurchaseSuccess}
          viewerHeaders={viewer.headers}
          buyerId={viewer.primaryId}
        />
      )}

    </>
  );
}

export default function StorePageClient() {
  return <StorePageContent />;
}
