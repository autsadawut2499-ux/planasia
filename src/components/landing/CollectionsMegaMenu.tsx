"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useBilingual } from "@/components/landing/useBilingual";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import {
  DEFAULT_MEGA_MENU_COLLECTIONS,
  visibleMegaMenuCollections,
} from "@/lib/admin/mega-menu-collections";

interface CollectionsMegaMenuPanelProps {
  onNavigate?: () => void;
}

/**
 * Collections mega menu — thumbnail card grid (admin-managed).
 * Sized like the original ABHP-style panel so cards are clearly visible.
 */
export function CollectionsMegaMenuPanel({ onNavigate }: CollectionsMegaMenuPanelProps) {
  const L = useBilingual();
  const siteConfig = useSiteConfigOptional();

  const tiles = useMemo(() => {
    const source = siteConfig?.megaMenuCollections?.length
      ? siteConfig.megaMenuCollections
      : DEFAULT_MEGA_MENU_COLLECTIONS;
    return visibleMegaMenuCollections(source);
  }, [siteConfig?.megaMenuCollections]);

  const fallbackImg =
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=480&q=80";

  return (
    <div className="box-border w-full max-w-full rounded-xl border border-border/80 bg-white p-4 shadow-[0_16px_48px_rgba(15,23,42,0.16)] sm:p-5 md:p-6">
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-3 md:gap-x-5 md:gap-y-6">
        {tiles.map((tile) => {
          const href =
            tile.href && tile.href !== "/store"
              ? tile.href
              : DEFAULT_MEGA_MENU_COLLECTIONS.find((d) => d.id === tile.id)?.href ||
                `/store?collection=${encodeURIComponent(tile.id)}`;

          return (
            <Link
              key={tile.id}
              href={href}
              onClick={onNavigate}
              className="group flex flex-col items-center text-center"
            >
              <span className="aspect-[4/3] w-full overflow-hidden rounded-md bg-surface-raised ring-1 ring-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.imageUrl || fallbackImg}
                  alt={L(tile.titleEn, tile.titleTh)}
                  loading="lazy"
                  decoding="async"
                  className="media-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (el.src !== fallbackImg) el.src = fallbackImg;
                  }}
                />
              </span>
              <span className="mt-2 text-[11px] font-medium tracking-wide text-[#1e3a5f] group-hover:text-[#1e40af] md:text-xs">
                {L(tile.titleEn, tile.titleTh)}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center border-t border-border/70 pt-5">
        <Link
          href="/store"
          onClick={onNavigate}
          className="rounded-full bg-[#1e40af] px-6 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#1e3a8a]"
        >
          {L("See All Collections", "ดูคอลเลกชันทั้งหมด")}
        </Link>
      </div>
    </div>
  );
}
