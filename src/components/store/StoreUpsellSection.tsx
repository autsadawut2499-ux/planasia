"use client";

import { Plus, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useStoreCart } from "@/context/StoreCartContext";
import { useToast } from "@/context/ToastContext";
import { useStoreListingCopy } from "@/hooks/useStoreListingCopy";
import { formatPrice } from "@/lib/i18n";
import {
  BUNDLE_DISCOUNT_2,
  BUNDLE_DISCOUNT_3_PLUS,
  getSimilarListings,
  getUpsellSuggestions,
} from "@/lib/store/cart-pricing";
import type { StoreListing } from "@/lib/store/db";

interface StoreUpsellSectionProps {
  listings: StoreListing[];
  anchor?: StoreListing | null;
  variant?: "full" | "compact";
  className?: string;
}

function UpsellListingCard({
  listing,
  variant,
  inCart,
  onAdd,
}: {
  listing: StoreListing;
  variant: "full" | "compact";
  inCart: boolean;
  onAdd: () => void;
}) {
  const { country, locale, translate } = useApp();
  const copy = useStoreListingCopy(listing);

  return (
    <article
      className={`flex overflow-hidden rounded-lg border border-border bg-white ${
        variant === "compact" ? "gap-3 p-2" : "flex-col"
      }`}
    >
      <img
        src={listing.image}
        alt={copy.name}
        className={
          variant === "compact"
            ? "h-14 w-16 shrink-0 rounded object-cover"
            : "aspect-[4/3] w-full object-cover"
        }
      />
      <div className={variant === "compact" ? "min-w-0 flex-1" : "p-3"}>
        <p className="line-clamp-1 text-xs font-semibold text-text-primary">{copy.name}</p>
        <p className="mt-0.5 text-xs font-bold text-[#1e40af]">
          {formatPrice(listing.price, country.currency, locale)}
        </p>
        <button
          type="button"
          disabled={inCart}
          onClick={onAdd}
          className={`mt-2 flex w-full items-center justify-center gap-1 rounded py-1.5 text-[10px] font-semibold uppercase tracking-wide ${
            inCart
              ? "bg-surface-raised text-text-muted"
              : "bg-[#1e40af] text-white hover:bg-[#1d4ed8]"
          }`}
        >
          <Plus className="h-3 w-3" />
          {inCart ? translate("store.cartInCart") : translate("store.addToCart")}
        </button>
      </div>
    </article>
  );
}

export function StoreUpsellSection({
  listings,
  anchor,
  variant = "full",
  className = "",
}: StoreUpsellSectionProps) {
  const { translate } = useApp();
  const { items, addItem, isInCart } = useStoreCart();
  const { success: toastSuccess } = useToast();

  const similar = useMemo(
    () => getSimilarListings(listings, items, anchor, variant === "compact" ? 3 : 4),
    [listings, items, anchor, variant],
  );

  const explore = useMemo(
    () => getUpsellSuggestions(listings, items),
    [listings, items],
  );

  const suggestions = similar.length > 0 ? similar : explore;
  if (suggestions.length === 0) return null;

  const handleAdd = (listing: StoreListing) => {
    if (isInCart(listing.id)) return;
    addItem(listing);
    toastSuccess(translate("store.cartAdded"));
  };

  const bundleHint =
    items.length === 1
      ? translate("store.upsell.bundleHint2").replace("{pct}", String(Math.round(BUNDLE_DISCOUNT_2 * 100)))
      : items.length === 2
        ? translate("store.upsell.bundleHint3").replace("{pct}", String(Math.round(BUNDLE_DISCOUNT_3_PLUS * 100)))
        : null;

  return (
    <section className={className}>
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#1e40af]" />
        <h3 className="text-sm font-bold text-text-primary">
          {similar.length > 0 ? translate("store.upsell.similarStyle") : translate("store.upsell.exploreMore")}
        </h3>
      </div>

      {bundleHint && variant === "compact" && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{bundleHint}</p>
      )}

      <div className={variant === "compact" ? "space-y-2" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-4"}>
        {suggestions.map((listing) => (
          <UpsellListingCard
            key={listing.id}
            listing={listing}
            variant={variant}
            inCart={isInCart(listing.id)}
            onAdd={() => handleAdd(listing)}
          />
        ))}
      </div>
    </section>
  );
}
