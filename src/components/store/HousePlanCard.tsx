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
  type PlanCardSpec,
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
  const primarySpecs = specs.slice(0, 4);
  const secondarySpecs = specs.slice(4);
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
      className={`store-card group relative flex h-full w-full min-w-0 flex-col font-sans antialiased tracking-[-0.01em] ${className}`}
    >
      {/* Stretch link — click anywhere on the card → detail page */}
      <Link
        href={detailHref}
        className="absolute inset-0 z-[1] rounded-[inherit]"
        aria-label={`${L("View plan", "ดูแบบ")} ${item.planId} — ${localized.name}`}
        onClick={() => track(item.id, "view", { source: "store-card" })}
      />

      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-surface-raised">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={localized.name}
          loading={index < 3 ? "eager" : "lazy"}
          decoding="async"
          className="media-cover transition-transform duration-500 group-hover:scale-[1.02]"
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

      <div className="relative z-0 flex min-w-0 items-start justify-between gap-2 px-3 pt-3 sm:gap-3 sm:px-4 sm:pt-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold leading-none text-[#334155] sm:text-[11px]">
            {L("Plan number", "แผนงานหมายเลข")}
          </p>
          <p className="mt-1 truncate text-[14px] font-extrabold leading-tight text-[#0b1220] sm:text-[16px]">
            #{item.planId}
          </p>
        </div>
        <div className="max-w-[45%] shrink-0 text-right">
          {sale.price <= 0 ? (
            <p className="pt-3 text-[14px] font-extrabold leading-none text-emerald-800 sm:text-[16px]">
              {L("Free", "ฟรี")}
            </p>
          ) : sale.compareAt != null ? (
            <>
              <p className="text-[10px] font-semibold leading-none text-[#b91c1c] sm:text-[11px]">
                {L("Sale", "ลดราคา")}
              </p>
              <p className="mt-0.5 truncate text-[10px] font-semibold text-[#64748b] line-through sm:text-[11px]">
                {formatMoney(sale.compareAt)}
              </p>
              <p className="truncate text-[14px] font-extrabold leading-none text-[#1e3a8a] sm:text-[16px]">
                {formatMoney(sale.price)}
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-semibold leading-none text-[#64748b] sm:text-[11px]">
                {L("Starting at", "เริ่มต้นที่")}
              </p>
              <p className="mt-1 truncate text-[14px] font-extrabold leading-none text-[#1e3a8a] sm:text-[16px]">
                {formatMoney(sale.price)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="relative z-0 mt-auto min-w-0 border-t border-[#e8eaee] px-2.5 pb-3 pt-2.5 sm:px-3 sm:pb-3.5 sm:pt-3">
        <div className="grid grid-cols-4 gap-y-1">
          {primarySpecs.map((spec, i) => (
            <SpecCell
              key={`${spec.labelEn}-${i}`}
              spec={spec}
              label={L(spec.labelEn, spec.labelTh)}
              showDivider={i < primarySpecs.length - 1}
            />
          ))}
        </div>
        {secondarySpecs.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-y-1 border-t border-[#eef0f4] pt-2">
            {secondarySpecs.map((spec, i) => (
              <SpecCell
                key={`${spec.labelEn}-${i}`}
                spec={spec}
                label={L(spec.labelEn, spec.labelTh)}
                showDivider={i < secondarySpecs.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function SpecCell({
  spec,
  label,
  showDivider,
}: {
  spec: PlanCardSpec;
  label: string;
  showDivider: boolean;
}) {
  return (
    <div
      className={`min-w-0 px-0.5 py-0.5 text-center sm:px-1 sm:py-1 ${
        showDivider ? "border-r border-[#e5e7eb]" : ""
      }`}
    >
      <p className="text-[9px] font-semibold leading-tight text-[#64748b] sm:text-[10px]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[12px] font-extrabold tabular-nums leading-tight text-[#0b1220] sm:mt-1 sm:text-[14px]">
        {spec.value}
      </p>
    </div>
  );
}
