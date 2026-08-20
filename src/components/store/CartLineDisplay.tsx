"use client";

import { useApp } from "@/context/AppContext";
import { useStoreListingCopy } from "@/hooks/useStoreListingCopy";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { CartLineItem } from "@/lib/store/cart-pricing";
import type { StoreListing } from "@/lib/store/db";

function Thumb({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
      <OptimizedImage src={src} alt={alt} fill sizes="80px" quality={65} className="object-cover" />
    </div>
  );
}

function CartLineTranslated({
  item,
  listing,
}: {
  item: CartLineItem;
  listing: StoreListing;
}) {
  const { formatMoney } = useApp();
  const copy = useStoreListingCopy(listing);

  return (
    <>
      <Thumb src={item.image} alt={copy.name} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-text-primary">{copy.name}</p>
        <p className="font-price mt-1 text-sm font-bold text-[#1e40af]">{formatMoney(item.price)}</p>
      </div>
    </>
  );
}

function CartLineStatic({ item }: { item: CartLineItem }) {
  const { formatMoney } = useApp();

  return (
    <>
      <Thumb src={item.image} alt={item.name} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold text-text-primary">{item.name}</p>
        <p className="font-price mt-1 text-sm font-bold text-[#1e40af]">{formatMoney(item.price)}</p>
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
