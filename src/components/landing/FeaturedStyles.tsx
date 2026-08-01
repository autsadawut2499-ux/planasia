"use client";

import Link from "next/link";
import { useBilingual } from "@/components/landing/useBilingual";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import { DEFAULT_CURATED_STYLES, captionForStyle } from "@/lib/admin/curated-styles";
import { useApp } from "@/context/AppContext";

/** Map curated / HOUSE_STYLES ids → store taxonomy `?style=` filters. */
const STYLE_FILTER_ALIAS: Record<string, string> = {
  japanese: "muji",
  scandinavian: "nordic",
  "tropical-minimal": "tropical",
};

export function FeaturedStyles() {
  const L = useBilingual();
  const { locale } = useApp();
  const site = useSiteConfigOptional();
  const styles = (site?.curatedStyles?.length ? site.curatedStyles : DEFAULT_CURATED_STYLES)
    .filter((s) => Boolean(s.imageUrl))
    .slice(0, 4);

  return (
    <section className="section-pad bg-transparent">
      <div className="section-inner">
        <h2 className="text-center text-2xl font-semibold text-[#2b3a4a] md:text-3xl">
          {L("Featured Styles", "สไตล์แนะนำ")}
        </h2>

        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-7">
          {styles.map((tile) => {
            const label = captionForStyle(tile, locale, tile.id);
            const styleParam = STYLE_FILTER_ALIAS[tile.id] ?? tile.id;
            return (
              <Link
                key={tile.id}
                href={`/store?style=${encodeURIComponent(styleParam)}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.imageUrl}
                  alt={label}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
