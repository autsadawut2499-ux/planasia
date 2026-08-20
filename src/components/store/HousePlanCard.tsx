"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
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

function canOptimizeImage(src: string): boolean {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return false;
  try {
    const host = new URL(src, "https://planasia.local").hostname;
    return (
      host === "images.unsplash.com" ||
      host.endsWith(".supabase.co") ||
      host === "localhost" ||
      src.startsWith("/")
    );
  } catch {
    return false;
  }
}

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
 * House-plan product card — chrome matches Popular Plans (4:3 media, rounded-xl, soft shadow).
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
      className={`store-card group relative h-full font-sans antialiased tracking-[-0.01em] ${className}`}
    >
      <Link
        href={detailHref}
        className="absolute inset-0 z-[1] rounded-[inherit]"
        aria-label={`${L("View plan", "ดูแบบ")} ${item.planId} — ${localized.name}`}
        onClick={() => track(item.id, "view", { source: "store-card" })}
      />

      <div className="store-card__media">
        {canOptimizeImage(item.image) ? (
          <Image
            src={item.image}
            alt={localized.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={index < 3}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.image}
            alt={localized.name}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            className="transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {imageBadge && <div className="pointer-events-none absolute inset-0 z-[2]">{imageBadge}</div>}
        {canFavorite && (
          <button
            type="button"
            onClick={handleFavorite}
            className="store-card__fav active:scale-95"
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

      <div className="store-card__body">
        <div className="store-card-title-row relative z-0">
          <div className="min-w-0 flex-1">
            <p className="store-card-kicker truncate text-[11px] font-semibold leading-none text-[#64748b]">
              {L("House model", "แบบบ้าน")}
            </p>
            <p className="store-card-plan-id mt-1.5 truncate text-sm font-bold leading-tight text-[#1e3a5f] md:text-base">
              {localized.name}
            </p>
            {(item.tagline?.trim() || localized.description?.trim()) && (
              <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-[#64748b] md:text-xs">
                {item.tagline?.trim() || localized.description.trim()}
              </p>
            )}
          </div>
          <div className="max-w-[46%] shrink-0 text-right">
            {sale.price <= 0 ? (
              <p className="store-card-price pt-4 text-sm font-bold leading-none text-emerald-800 md:text-base">
                {L("Free", "ฟรี")}
              </p>
            ) : sale.compareAt != null ? (
              <>
                <p className="store-card-kicker text-[11px] font-semibold leading-none text-[#b91c1c]">
                  {L("Sale", "ลดราคา")}
                </p>
                <p className="store-card-price mt-1 truncate text-[11px] font-semibold text-[#94a3b8] line-through">
                  {formatMoney(sale.compareAt)}
                </p>
                <p className="store-card-price truncate text-sm font-bold leading-none text-[#1e40af] md:text-base">
                  {formatMoney(sale.price)}
                </p>
              </>
            ) : (
              <>
                <p className="store-card-kicker text-[11px] font-semibold leading-none text-[#64748b]">
                  {L("Starting at", "เริ่มต้นที่")}
                </p>
                <p className="store-card-price mt-1.5 truncate text-sm font-bold leading-none text-[#1e40af] md:text-base">
                  {formatMoney(sale.price)}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="store-card__specs-wrap relative z-0">
          <div className="store-card__specs">
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
            <div className="store-card__specs store-card__specs--secondary">
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
      className={`min-w-0 overflow-hidden px-0.5 py-0.5 text-center ${
        showDivider ? "border-r border-[#e5e7eb]" : ""
      }`}
    >
      <p className="truncate text-[10px] font-semibold leading-tight text-[#64748b]">
        {label}
      </p>
      <p className="mt-1 truncate text-[13px] font-bold tabular-nums leading-tight text-[#0b1220]">
        {spec.value}
      </p>
    </div>
  );
}
