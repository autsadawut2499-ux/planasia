"use client";

import { Heart, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useStoreBrowse } from "@/context/StoreBrowseContext";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import { formatPrice } from "@/lib/i18n";
import { listingStorePath } from "@/lib/seo/slug";
import type { StoreListing } from "@/lib/store/db";

export function StoreFavoritesDrawer() {
  const { country, locale, translate } = useApp();
  const { favorites, favoritesDrawerOpen, setFavoritesDrawerOpen, toggleFavorite } = useStoreBrowse();
  const viewer = useStoreViewer();
  const [listings, setListings] = useState<StoreListing[]>([]);

  const loadListings = useCallback(async () => {
    if (!viewer.ready) return;
    const res = await fetch("/api/store", { headers: viewer.headers() });
    const data = await res.json();
    setListings(data.listings ?? []);
  }, [viewer]);

  useEffect(() => {
    if (favoritesDrawerOpen) void loadListings();
  }, [favoritesDrawerOpen, loadListings]);

  if (!favoritesDrawerOpen) return null;

  const favoriteListings = listings.filter((l) => favorites.includes(l.id));

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[70] bg-black/40"
        aria-label={translate("nav.closeMenu")}
        onClick={() => setFavoritesDrawerOpen(false)}
      />
      <aside className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-[#1e40af] text-[#1e40af]" />
            <h2 className="text-lg font-bold text-text-primary">{translate("store.favoritesTitle")}</h2>
            <span className="rounded-full bg-[#1e40af] px-2 py-0.5 text-xs font-bold text-white">
              {favoriteListings.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFavoritesDrawerOpen(false)}
            className="rounded-lg p-2 hover:bg-surface-raised"
            aria-label={translate("nav.closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {favoriteListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <Heart className="mb-3 h-10 w-10 text-text-muted" />
              <p className="text-sm text-text-secondary">{translate("store.favoritesEmpty")}</p>
            </div>
          ) : (
            <ul className="divide-y divide-border px-5">
              {favoriteListings.map((item) => (
                <li key={item.id} className="flex gap-3 py-4">
                  <Link href={listingStorePath(item.slug)} onClick={() => setFavoritesDrawerOpen(false)}>
                    <img src={item.image} alt={item.name} className="h-16 w-20 rounded-lg object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={listingStorePath(item.slug)}
                      onClick={() => setFavoritesDrawerOpen(false)}
                      className="line-clamp-2 text-sm font-semibold text-text-primary hover:text-[#1e40af]"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm font-bold text-[#1e40af]">
                      {formatPrice(item.price, country.currency, locale)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(item.id)}
                    className="shrink-0 rounded p-1.5 text-[#1e40af] hover:bg-red-50 hover:text-red-600"
                    aria-label={translate("store.aria.removeFavorite")}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
