"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBilingual } from "@/components/landing/useBilingual";
import { HousePlanCard } from "@/components/store/HousePlanCard";
import type { StoreListing } from "@/lib/store/db";

interface FeaturedPlansProps {
  title?: string;
  exclusive?: boolean;
}

/** Gap between cards — kept in sync with .store-card-rail--compact gap. */
const CARD_GAP_PX = 24;

export function FeaturedPlans({ title, exclusive = false }: FeaturedPlansProps) {
  const L = useBilingual();
  const trackRef = useRef<HTMLDivElement>(null);
  const [plans, setPlans] = useState<StoreListing[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/store")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ listings?: StoreListing[] }>;
      })
      .then((data) => {
        if (!active) return;
        const all = data.listings ?? [];
        const picked = exclusive
          ? (() => {
              const pinned = all.filter((p) => p.pinned);
              if (pinned.length > 0) return pinned.slice(0, 12);
              return all.slice(6, 18).length > 0 ? all.slice(6, 18) : all.slice(0, 12);
            })()
          : all.slice(0, 12);
        setPlans(picked);
        setFailed(false);
      })
      .catch(() => {
        if (active) {
          setPlans([]);
          setFailed(true);
        }
      });
    return () => {
      active = false;
    };
  }, [exclusive]);

  const scroll = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const cols = el.clientWidth >= 1024 ? 4 : 2;
    const step = (el.clientWidth + CARD_GAP_PX) / cols;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (failed || plans.length === 0) return null;

  const heading =
    title ?? (exclusive ? L("Exclusive Designs", "แบบ Exclusive") : L("Featured New House Plans", "แบบบ้านใหม่แนะนำ"));

  return (
    <section className="section-pad bg-transparent">
      <div className="section-inner">
        <h2 className="text-center text-2xl font-semibold text-[#2b3a4a] md:text-3xl">{heading}</h2>

        <div className="relative mt-10 min-w-0 max-w-full overflow-x-clip">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={L("Previous plans", "ก่อนหน้า")}
            className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-[var(--color-card,#fff)] p-2.5 text-text-secondary shadow-md hover:text-[#1e40af] md:block lg:left-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={trackRef}
            className="store-card-rail store-card-rail--compact scroll-smooth"
          >
            {plans.map((plan, index) => (
              <div key={plan.id} className="store-card-rail__slide">
                <HousePlanCard
                  item={plan}
                  index={index}
                  imageBadge={
                    exclusive ? (
                      <span className="absolute left-2 top-2 rounded bg-[#1e3a5f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        {L("Exclusive", "เอ็กซ์คลูซีฟ")}
                      </span>
                    ) : undefined
                  }
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={L("Next plans", "ถัดไป")}
            className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-[var(--color-card,#fff)] p-2.5 text-text-secondary shadow-md hover:text-[#1e40af] md:block lg:right-0"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/store"
            className="rounded-md border border-[#1e40af]/40 px-7 py-3 text-xs font-bold uppercase tracking-wide text-[#1e40af] transition-colors hover:bg-[#1e40af] hover:text-white"
          >
            {exclusive ? L("View Exclusive Designs", "ดูแบบ Exclusive") : L("View New Plans", "ดูแบบบ้านใหม่")}
          </Link>
        </div>
      </div>
    </section>
  );
}
