"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useApp } from "@/context/AppContext";
import { useStoreBrowseOptional } from "@/context/StoreBrowseContext";
import { useInteractionTracker } from "@/hooks/useInteractionTracker";
import { useBilingual } from "@/components/landing/useBilingual";
import { useStoreListingCopy } from "@/hooks/useStoreListingCopy";
import { listingStorePath } from "@/lib/seo/slug";
import {
  buildPlanCardSpecs,
  resolveListingSale,
} from "@/lib/store/plan-card-specs";
import type { StoreListing } from "@/lib/store/db";

export interface HousePlanCardProps {
  item: StoreListing;
  index?: number;
  /** Extra badge over the image (e.g. Exclusive, match %). */
  imageBadge?: ReactNode;
  /** Show wishlist heart (default true when browse context exists). */
  favoritable?: boolean;
  className?: string;
}

/**
 * Compact clickable house-plan card — entire card opens the detail page.
 * No bottom action buttons (View / Cart / Buy).
 */
export function HousePlanCard({
  item,
  index = 0,
  imageBadge,
  favoritable = true,
  className = "",
}: HousePlanCardProps) {
  const { formatMoney, translate } = useApp();
  const L = useBilingual();
  const browse = useStoreBrowseOptional();
  const { track } = useInteractionTracker();
  const localized = useStoreListingCopy(item);
  const detailHref = listingStorePath(item.slug);
  const specs = buildPlanCardSpecs(item);
  const sale = resolveListingSale(item);
  const favorited = browse ? browse.isFavorite(item.id) : false;
  const canFavorite = favoritable && Boolean(browse);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!browse) return;
    if (!favorited) track(item.id, "wishlist", { source: "store-card" });
    browse.toggleFavorite(item.id);
  };

  return (
    <article
      className={`store-card group relative font-sans antialiased tracking-[-0.01em] ${className}`}
    >
      {/* Stretch link — click anywhere on the card → detail page */}
      <Link
        href={detailHref}
        className="absolute inset-0 z-[1] rounded-[inherit]"
        aria-label={`${L("View plan", "ดูแบบ")} ${item.planId} — ${localized.name}`}
        onClick={() => track(item.id, "view", { source: "store-card" })}
      />

      <div className="relative aspect-[16/10] overflow-hidden bg-surface-raised">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={localized.name}
          loading={index < 3 ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {imageBadge && <div className="pointer-events-none absolute inset-0 z-[2]">{imageBadge}</div>}
        {canFavorite && (
          <button
            type="button"
            onClick={handleFavorite}
            className="absolute bottom-2.5 right-2.5 z-[3] flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/5 active:scale-95"
            aria-label={
              favorited ? translate("store.aria.removeFavorite") : translate("store.aria.save")
            }
          >
            <Heart
              className={`h-3.5 w-3.5 ${
                favorited ? "fill-red-500 text-red-500" : "text-red-500"
              }`}
              strokeWidth={1.75}
            />
          </button>
        )}
      </div>

      <div className="relative z-0 flex items-start justify-between gap-3 px-4 pt-3.5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold leading-none text-[#334155]">
            {L("Plan number", "แผนงานหมายเลข")}
          </p>
          <p className="mt-1 truncate text-[15px] font-extrabold leading-tight text-[#0b1220] sm:text-[16px]">
            #{item.planId}
          </p>
        </div>
        <div className="shrink-0 text-right">
          {sale.price <= 0 ? (
            <p className="pt-3 text-[15px] font-extrabold leading-none text-emerald-800 sm:text-[16px]">
              {L("Free", "ฟรี")}
            </p>
          ) : sale.compareAt != null ? (
            <>
              <p className="text-[11px] font-semibold leading-none text-[#b91c1c]">
                {L("Sale", "ลดราคา")}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#64748b] line-through">
                {formatMoney(sale.compareAt)}
              </p>
              <p className="text-[15px] font-extrabold leading-none text-[#1e3a8a] sm:text-[16px]">
                {formatMoney(sale.price)}
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-semibold leading-none text-[#64748b]">
                {L("Starting at", "เริ่มต้นที่")}
              </p>
              <p className="mt-1 text-[15px] font-extrabold leading-none text-[#1e3a8a] sm:text-[16px]">
                {formatMoney(sale.price)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="relative z-0 mt-3 border-t border-[#e8eaee] px-2 pb-3.5 pt-3 sm:px-3">
        <div className="grid grid-cols-4">
          {specs.map((spec, i) => {
            const endOfRow = (i + 1) % 4 === 0;
            return (
              <div
                key={`${spec.labelEn}-${i}`}
                className={`min-w-0 px-1 py-1 text-center ${
                  endOfRow ? "" : "border-r border-[#e5e7eb]"
                }`}
              >
                <p className="truncate text-[10px] font-semibold leading-tight text-[#475569]">
                  {L(spec.labelEn, spec.labelTh)}
                </p>
                <p className="mt-1 truncate text-[14px] font-extrabold leading-none text-[#0b1220] sm:text-[15px]">
                  {spec.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
