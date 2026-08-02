"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";
import { useStoreViewer } from "@/hooks/useStoreViewer";
import { useInteractionTracker } from "@/hooks/useInteractionTracker";
import { HousePlanCard } from "@/components/store/HousePlanCard";
import type { ScoredListing } from "@/lib/recommend/types";

interface RecommendedForYouProps {
  /** Query params forwarded to /api/recommendations (beds, baths, style, area…). */
  filters?: Record<string, string | number | undefined>;
  /** Bias toward plans similar to this listing (detail-page context). */
  seedListingId?: string;
  excludeIds?: string[];
  limit?: number;
  className?: string;
}

export function RecommendedForYou({
  filters,
  seedListingId,
  excludeIds,
  limit = 8,
  className,
}: RecommendedForYouProps) {
  const t = useBilingual();
  const viewer = useStoreViewer();
  const { track } = useInteractionTracker();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<ScoredListing[]>([]);
  const [loading, setLoading] = useState(true);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== "" && value !== 0) {
          params.set(key, String(value));
        }
      }
    }
    if (seedListingId) params.set("seed", seedListingId);
    if (excludeIds?.length) params.set("exclude", excludeIds.join(","));
    params.set("limit", String(limit));
    return params.toString();
  }, [filters, seedListingId, excludeIds, limit]);

  useEffect(() => {
    if (!viewer.ready) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/recommendations?${queryString}`, { headers: viewer.headers() })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ recommendations?: ScoredListing[] }>;
      })
      .then((data) => {
        if (!cancelled) setItems(data.recommendations ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [queryString, viewer]);

  const scrollBy = useCallback((dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cols = el.clientWidth >= 1024 ? 4 : 2;
    const gap = 24;
    const step = (el.clientWidth + gap) / cols;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className={`font-sans ${className ?? ""}`}>
      {/* Same content width as Popular Plans / Featured sections */}
      <div className="section-inner">
        <div className="mb-6 flex items-end justify-between gap-3 md:mb-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1e40af] to-[#3b82f6] text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              <h2 className="text-xl font-semibold text-[#2b3a4a] md:text-2xl">
                {t("Recommended for You", "แบบบ้านที่เหมาะกับคุณที่สุด")}
              </h2>
            </div>
            <p className="mt-1.5 text-sm text-text-muted">
              {t(
                "Personalised matches based on your preferences and browsing.",
                "คัดสรรให้ตรงใจจากความสนใจและประวัติการเลือกดูของคุณ",
              )}
            </p>
          </div>
          <div className="hidden shrink-0 gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label={t("Scroll left", "เลื่อนซ้าย")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-[var(--color-card,#fff)] text-text-secondary shadow-sm hover:bg-surface-raised"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label={t("Scroll right", "เลื่อนขวา")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-[var(--color-card,#fff)] text-text-secondary shadow-sm hover:bg-surface-raised"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={scrollerRef} className="store-card-rail store-card-rail--compact">
          {items.map(({ listing, matchScore }, index) => (
            <div
              key={listing.id}
              className="store-card-rail__slide"
              onClick={() => track(listing.id, "view", { source: "recommendation" })}
            >
              <HousePlanCard
                item={listing}
                index={index}
                imageBadge={
                  <span className="store-card-badge absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    {matchScore}%
                    <span className="font-normal opacity-80">{t("match", "ตรงใจ")}</span>
                  </span>
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
