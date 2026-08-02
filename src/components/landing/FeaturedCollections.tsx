"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useBilingual } from "@/components/landing/useBilingual";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import {
  DEFAULT_MEGA_MENU_COLLECTIONS,
  visibleMegaMenuCollections,
} from "@/lib/admin/mega-menu-collections";

/** Featured collections — first 4 enabled cards from admin-managed collections. */
export function FeaturedCollections() {
  const L = useBilingual();
  const siteConfig = useSiteConfigOptional();

  const tiles = useMemo(() => {
    const source = siteConfig?.megaMenuCollections?.length
      ? siteConfig.megaMenuCollections
      : DEFAULT_MEGA_MENU_COLLECTIONS;
    return visibleMegaMenuCollections(source).slice(0, 4);
  }, [siteConfig?.megaMenuCollections]);

  const fallbackImg =
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80";

  return (
    <section className="section-pad bg-transparent">
      <div className="section-inner">
        <h2 className="text-center text-2xl font-semibold text-[#2b3a4a] md:text-3xl">
          {L("Featured Collections", "คอลเลกชันแนะนำ")}
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-7">
          {tiles.map((tile) => {
            const label = L(tile.titleEn, tile.titleTh);
            return (
              <Link
                key={tile.id}
                href={tile.href || "/store"}
                className="group relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.imageUrl || fallbackImg}
                  alt={label}
                  loading="lazy"
                  decoding="async"
                  className="media-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const el = e.currentTarget;
                    if (el.src !== fallbackImg) el.src = fallbackImg;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-3 left-3 rounded bg-[#1e3a5f] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/store"
            className="rounded-md border border-[#1e40af]/40 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-[#1e40af] transition-colors hover:bg-[#1e40af] hover:text-white"
          >
            {L("Browse all plans", "ดูแบบบ้านทั้งหมด")}
          </Link>
        </div>
      </div>
    </section>
  );
}
