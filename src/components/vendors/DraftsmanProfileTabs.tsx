"use client";

import { useState } from "react";
import { Images, LayoutGrid, UserRound } from "lucide-react";

export type DraftsmanTabId = "overview" | "portfolio" | "gallery";

interface DraftsmanProfileTabsProps {
  portfolioCount: number;
  galleryCount: number;
  overview: React.ReactNode;
  portfolio: React.ReactNode;
  gallery: React.ReactNode;
}

/**
 * Public profile sections. The portfolio tab collects every plan the draftsman
 * has listed for sale, so buyers can browse one designer's full body of work.
 */
export function DraftsmanProfileTabs({
  portfolioCount,
  galleryCount,
  overview,
  portfolio,
  gallery,
}: DraftsmanProfileTabsProps) {
  const [tab, setTab] = useState<DraftsmanTabId>("portfolio");

  const tabs: Array<{ id: DraftsmanTabId; label: string; icon: React.ReactNode; count?: number }> = [
    { id: "overview", label: "เกี่ยวกับช่างเขียนแบบ", icon: <UserRound className="h-4 w-4" /> },
    {
      id: "portfolio",
      label: "ผลงานทั้งหมดของช่างคนนี้",
      icon: <LayoutGrid className="h-4 w-4" />,
      count: portfolioCount,
    },
    ...(galleryCount > 0
      ? [
          {
            id: "gallery" as const,
            label: "ภาพผลงาน",
            icon: <Images className="h-4 w-4" />,
            count: galleryCount,
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="sticky top-[64px] z-10 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 md:px-6">
          <div
            role="tablist"
            aria-label="ส่วนต่างๆ ของโปรไฟล์"
            className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                  tab === t.id
                    ? "border-[#1e40af] text-[#1e40af]"
                    : "border-transparent text-text-muted hover:text-text-secondary"
                }`}
              >
                {t.icon}
                {t.label}
                {t.count != null && (
                  <span className="rounded-full bg-surface-raised px-1.5 py-0.5 text-[11px] tabular-nums text-text-secondary">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div key={tab} className="panel-enter">
        {tab === "overview" && overview}
        {tab === "portfolio" && portfolio}
        {tab === "gallery" && gallery}
      </div>
    </>
  );
}
