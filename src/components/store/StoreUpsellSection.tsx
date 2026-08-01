"use client";

import { Plus, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useStoreCart } from "@/context/StoreCartContext";
import { useToast } from "@/context/ToastContext";
import { useStoreListingCopy } from "@/hooks/useStoreListingCopy";
import { HousePlanCard } from "@/components/store/HousePlanCard";
import {
  BUNDLE_DISCOUNT_2,
  BUNDLE_DISCOUNT_3_PLUS,
  getSimilarListings,
  getUpsellSuggestions,
} from "@/lib/store/cart-pricing";
import type { StoreListing } from "@/lib/store/db";
import { isListingPurchasable } from "@/lib/store/listing-purchase";

interface StoreUpsellSectionProps {
  listings: StoreListing[];
  anchor?: StoreListing | null;
  variant?: "full" | "compact";
  className?: string;
}

function CompactUpsellCard({
  listing,
  inCart,
  onAdd,
}: {
  listing: StoreListing;
  inCart: boolean;
  onAdd: () => void;
}) {
  const { formatMoney, translate } = useApp();
  const copy = useStoreListingCopy(listing);
  const canPurchase = isListingPurchasable(listing);

  return (
    <article className="flex gap-3 overflow-hidden rounded-lg border border-border bg-[var(--color-card,#fff)] p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={listing.image}
        alt={copy.name}
        className="h-14 w-16 shrink-0 rounded object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-xs font-semibold text-text-primary">#{listing.planId}</p>
        <p className="mt-0.5 text-xs font-bold text-[#1e40af]">{formatMoney(listing.price)}</p>
        <button
          type="button"
          disabled={inCart || !canPurchase}
          onClick={onAdd}
          className={`mt-2 flex w-full items-center justify-center gap-1 rounded py-1.5 text-[10px] font-semibold uppercase tracking-wide ${
            inCart || !canPurchase
              ? "bg-surface-raised text-text-muted"
              : "bg-[#1e40af] text-white hover:bg-[#1d4ed8]"
          }`}
        >
          <Plus className="h-3 w-3" />
          {!canPurchase
            ? "รออนุมัติ"
            : inCart
              ? translate("store.cartInCart")
              : translate("store.addToCart")}
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
    if (!isListingPurchasable(listing)) return;
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

      {variant === "compact" ? (
        <div className="space-y-2">
          {suggestions.map((listing) => (
            <CompactUpsellCard
              key={listing.id}
              listing={listing}
              inCart={isInCart(listing.id)}
              onAdd={() => handleAdd(listing)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((listing, index) => (
            <HousePlanCard key={listing.id} item={listing} index={index} />
          ))}
        </div>
      )}
    </section>
  );
}
