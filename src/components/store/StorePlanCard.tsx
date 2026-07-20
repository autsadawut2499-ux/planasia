"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useStoreBrowse } from "@/context/StoreBrowseContext";
import { useStoreListingCopy } from "@/hooks/useStoreListingCopy";
import { formatPrice } from "@/lib/i18n";
import { listingStorePath } from "@/lib/seo/slug";
import type { StoreListing } from "@/lib/store/db";

interface StorePlanCardProps {
  item: StoreListing;
  index: number;
  onQuickView: () => void;
  onBuy: () => void;
  onAddToCart: () => void;
  inCart?: boolean;
}

export function StorePlanCard({ item, index, onQuickView, onBuy, onAddToCart, inCart }: StorePlanCardProps) {
  const { country, locale, translate } = useApp();
  const { isFavorite, toggleFavorite } = useStoreBrowse();
  const localized = useStoreListingCopy(item);
  const favorited = isFavorite(item.id);
  const planNumber = `#${4534}-${String(index + 1).padStart(5, "0")}`;
  const detailHref = listingStorePath(item.slug);

  return (
    <article className="store-card group">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-raised">
        <Link href={detailHref} className="block h-full w-full">
          <img
            src={item.image}
            alt={localized.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <button
          type="button"
          onClick={() => toggleFavorite(item.id)}
          className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md"
          aria-label={favorited ? translate("store.aria.removeFavorite") : translate("store.aria.save")}
        >
          <Heart className={`h-4 w-4 ${favorited ? "fill-[#1e40af] text-[#1e40af]" : "text-text-muted"}`} />
        </button>
        <span className="absolute left-3 top-3 rounded bg-[#1e40af] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          {translate("store.communityBadge")}
        </span>
      </div>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              {translate("store.planLabel")} {planNumber}
            </p>
            <Link href={detailHref} className="mt-0.5 line-clamp-2 text-sm font-semibold text-text-primary hover:text-[#1e40af]">
              {localized.name}
            </Link>
          </div>
          <p className="shrink-0 text-right">
            <span className="block text-[10px] text-text-muted">{translate("store.startingAt")}</span>
            <span className="text-base font-bold text-[#1e40af]">
              {formatPrice(item.price, country.currency, locale)}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-4 gap-px overflow-hidden rounded border border-border bg-border text-center">
          {[
            { label: translate("store.specSqft"), value: localized.area.replace(/[^0-9.]/g, "") || "—" },
            { label: translate("store.specBeds"), value: String(item.beds) },
            { label: translate("store.specBaths"), value: String(item.baths) },
            { label: translate("store.specStories"), value: String(item.floors) },
          ].map((spec) => (
            <div key={spec.label} className="bg-white px-1 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wide text-text-muted">{spec.label}</p>
              <p className="mt-0.5 text-sm font-semibold text-text-primary">{spec.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={onQuickView}
            className="rounded border border-[#1e40af] py-2.5 text-[10px] font-semibold uppercase tracking-wide text-[#1e40af] hover:bg-blue-50 sm:text-xs"
          >
            {translate("store.viewPlan")}
          </button>
          <button
            type="button"
            onClick={onAddToCart}
            disabled={inCart}
            className="rounded border border-border py-2.5 text-[10px] font-semibold uppercase tracking-wide text-text-primary hover:bg-surface-raised disabled:opacity-50 sm:text-xs"
          >
            {inCart ? translate("store.cartInCart") : translate("store.addToCart")}
          </button>
          <button
            type="button"
            onClick={onBuy}
            className="rounded bg-[#1e40af] py-2.5 text-[10px] font-semibold uppercase tracking-wide text-white hover:bg-[#1d4ed8] sm:text-xs"
          >
            {translate("store.buyNow")}
          </button>
        </div>
      </div>
    </article>
  );
}
