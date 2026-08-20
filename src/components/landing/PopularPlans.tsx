"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import {
  DEFAULT_POPULAR_HIGHLIGHTS,
  visiblePopularHighlights,
  type PopularHighlightCard,
} from "@/lib/admin/popular-highlights";

/**
 * Homepage "Popular house plan topics" — up to 4 curated cards (admin-managed).
 *
 * Important: do NOT paint DEFAULT demo Unsplash images first and then swap
 * `src` on the same nodes — that leaves ghost/demo photos under the real ones.
 * We show neutral skeletons until the API resolves, then mount fresh cards.
 */
export function PopularPlans({ className }: { className?: string }) {
  const L = useBilingual();
  const [cards, setCards] = useState<PopularHighlightCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Clear any previous paint before fetching (Strict Mode / remount safety).
    setCards([]);
    setLoading(true);

    fetch("/api/popular-highlights", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ cards?: PopularHighlightCard[] }>;
      })
      .then((data) => {
        if (!active) return;
        const next = data.cards?.length
          ? visiblePopularHighlights(data.cards)
          : visiblePopularHighlights(DEFAULT_POPULAR_HIGHLIGHTS);
        setCards(next);
      })
      .catch(() => {
        if (active) setCards(visiblePopularHighlights(DEFAULT_POPULAR_HIGHLIGHTS));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!loading && cards.length === 0) return null;

  const skeletonCount = 4;
  const gridCount = loading ? skeletonCount : cards.length;
  const gridClass =
    gridCount <= 1
      ? "mx-auto max-w-md grid-cols-1"
      : gridCount === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : gridCount === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className={className ?? "section-pad bg-transparent"}>
      <div className="section-inner">
        <div className="flex items-center justify-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" aria-hidden />
          <h2 className="text-center text-2xl font-semibold text-[#2b3a4a] md:text-3xl">
            {L("Popular House Plans", "แบบบ้านยอดนิยม")}
          </h2>
        </div>
        <p className="mt-2 text-center text-sm text-text-muted">
          {L(
            "Hand-picked topics to help you start browsing",
            "หัวข้อคัดสรร ช่วยให้คุณเริ่มเลือกชมแบบบ้านได้ง่ายขึ้น",
          )}
        </p>

        <div className={`mt-10 grid gap-5 sm:gap-6 ${gridClass}`}>
          {loading
            ? Array.from({ length: skeletonCount }, (_, i) => (
                <div
                  key={`popular-skeleton-${i}`}
                  className="store-card pointer-events-none"
                  aria-hidden
                >
                  <div className="store-card__media animate-pulse bg-slate-200" />
                  <div className="space-y-2 p-5">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))
            : cards.map((card, i) => (
                <Link
                  key={`${card.id}::${card.imageUrl}`}
                  href={card.href || "/store"}
                  className="store-card group"
                >
                  <div className="store-card__media">
                    <OptimizedImage
                      key={`${card.id}-img-${card.imageUrl}`}
                      src={card.imageUrl}
                      alt={L(card.titleEn, card.titleTh)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={i < 2}
                      quality={70}
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                    <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-bold text-[#1e3a5f] group-hover:text-[#1e40af] md:text-base">
                      {L(card.titleEn, card.titleTh)}
                    </h3>
                    {(card.descriptionTh || card.descriptionEn) && (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-secondary md:text-[13px]">
                        {L(card.descriptionEn, card.descriptionTh)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/store"
            className="rounded-md border border-[#1e40af]/40 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-[#1e40af] transition-colors hover:bg-[#1e40af] hover:text-white"
          >
            {L("Browse All Plans", "ดูแบบบ้านทั้งหมด")}
          </Link>
        </div>
      </div>
    </section>
  );
}
