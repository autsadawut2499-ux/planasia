"use client";

import { useApp } from "@/context/AppContext";
import { useStoreListingCopy } from "@/hooks/useStoreListingCopy";
import { formatPrice } from "@/lib/i18n";
import type { CartLineItem } from "@/lib/store/cart-pricing";
import type { StoreListing } from "@/lib/store/db";

function CartLineTranslated({
  item,
  listing,
}: {
  item: CartLineItem;
  listing: StoreListing;
}) {
  const { country, locale } = useApp();
  const copy = useStoreListingCopy(listing);

  return (
    <>
      <img src={item.image} alt={copy.name} className="h-16 w-20 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-text-primary">{copy.name}</p>
        <p className="mt-1 text-sm font-bold text-[#1e40af]">
          {formatPrice(item.price, country.currency, locale)}
        </p>
      </div>
    </>
  );
}

function CartLineStatic({ item }: { item: CartLineItem }) {
  const { country, locale } = useApp();

  return (
    <>
      <img src={item.image} alt={item.name} className="h-16 w-20 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-text-primary">{item.name}</p>
        <p className="mt-1 text-sm font-bold text-[#1e40af]">
          {formatPrice(item.price, country.currency, locale)}
        </p>
      </div>
    </>
  );
}

export function CartLineDisplay({
  item,
  listing,
}: {
  item: CartLineItem;
  listing?: StoreListing;
}) {
  if (listing) {
    return <CartLineTranslated item={item} listing={listing} />;
  }
  return <CartLineStatic item={item} />;
}
