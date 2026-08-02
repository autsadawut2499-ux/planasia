"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";
import {
  DEFAULT_POPULAR_HIGHLIGHTS,
  visiblePopularHighlights,
  type PopularHighlightCard,
} from "@/lib/admin/popular-highlights";

/**
 * Homepage "Popular house plan topics" — up to 4 curated cards (admin-managed).
 * Falls back to defaults if the API fails so the section stays stable.
 */
export function PopularPlans({ className }: { className?: string }) {
  const L = useBilingual();
  const [cards, setCards] = useState<PopularHighlightCard[]>(() =>
    visiblePopularHighlights(DEFAULT_POPULAR_HIGHLIGHTS),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/popular-highlights", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ cards?: PopularHighlightCard[] }>;
      })
      .then((data) => {
        if (!active) return;
        const next = data.cards?.length
          ? data.cards
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

        <div
          className={`mt-10 grid gap-5 sm:gap-6 ${
            cards.length <= 1
              ? "mx-auto max-w-md grid-cols-1"
              : cards.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : cards.length === 3
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {(loading ? visiblePopularHighlights(DEFAULT_POPULAR_HIGHLIGHTS) : cards).map((card, i) => (
            <Link
              key={card.id}
              href={card.href || "/store"}
              className={`group overflow-hidden rounded-xl border border-border bg-[var(--color-card,#fff)] shadow-sm transition-shadow hover:shadow-md ${
                loading ? "animate-pulse" : ""
              }`}
            >
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-surface-raised">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.imageUrl}
                  alt={L(card.titleEn, card.titleTh)}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="media-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
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
