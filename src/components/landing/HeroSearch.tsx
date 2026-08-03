"use client";

import { useState } from "react";
import { useBilingual } from "@/components/landing/useBilingual";
import { useApp } from "@/context/AppContext";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import { openAiPlanChat } from "@/components/chat/AiPlanChat";
import { DEFAULT_SITE_SETTINGS } from "@/lib/admin/defaults";

const FALLBACK_HERO_IMAGE = DEFAULT_SITE_SETTINGS.hero.backgroundImageUrl;

const SUGGESTIONS_TH = [
  "บ้าน 3 ห้องนอน งบไม่เกิน 3 ล้าน",
  "สไตล์โมเดิร์น ที่ดินกว้าง 10 ม.",
  "บ้านชั้นเดียว ประมาณ 120 ตร.ม.",
];

const SUGGESTIONS_EN = [
  "3-bedroom house under 3M THB",
  "Modern style, 10m-wide land",
  "Single-storey around 120 sqm",
];

/**
 * Hero cover + compact in-place AI plan search.
 * Mobile: AI card stacked under the cover.
 * Desktop: compact floating AI bar over the cover.
 */
export function HeroSearch() {
  const L = useBilingual();
  const { uiLocale } = useApp();
  const siteConfig = useSiteConfigOptional();
  const coverImage =
    siteConfig?.settings.hero.backgroundImageUrl?.trim() || FALLBACK_HERO_IMAGE;

  const [query, setQuery] = useState("");
  const suggestions = uiLocale === "th" ? SUGGESTIONS_TH : SUGGESTIONS_EN;

  const launchAi = (text?: string) => {
    const message = (text ?? query).trim();
    openAiPlanChat(message || undefined);
  };

  return (
    <section className="relative w-full">
      <div className="hero-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={coverImage}
          src={coverImage}
          alt={L("Featured house cover", "ภาพปกแบบบ้านหน้าแรก")}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
      </div>

      <div className="relative z-10 px-4 py-3 md:absolute md:inset-x-0 md:bottom-[20%] md:px-4 md:py-0">
        <div className="hero-ai-search mx-auto w-full max-w-md md:max-w-[640px] lg:w-[48%] lg:max-w-[640px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              launchAi();
            }}
            className="rounded-xl border border-[#1A2744]/08 bg-white/95 px-2.5 py-2 shadow-[0_8px_24px_rgba(26,39,68,0.14)] backdrop-blur-md md:rounded-2xl md:border-white/70 md:bg-white/94 md:px-2 md:py-1.5 md:shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
          >
            <label className="sr-only" htmlFor="hero-ai-query">
              {L("AI house-plan search", "AI ค้นหาแบบบ้าน")}
            </label>
            <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:gap-1.5">
              <input
                id="hero-ai-query"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={L(
                  "e.g. 3 beds, modern, under 2.5M…",
                  "เช่น 3 ห้องนอน โมเดิร์น งบ 2.5 ล้าน…",
                )}
                autoComplete="off"
                className="min-w-0 flex-1 rounded-full border-none bg-[#f4f6f9] px-3.5 py-2 text-[13px] text-[#1A2744] outline-none placeholder:text-slate-400 md:bg-[#f0f3f8] md:py-1.5 md:text-xs"
              />

              <button
                type="submit"
                className="hero-ai-search__cta inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full bg-gradient-to-br from-[#1a2744] via-[#1e40af] to-[#2563eb] px-4 py-2 text-[12px] font-bold tracking-[0.01em] text-white shadow-[0_6px_18px_rgba(30,64,175,0.35)] transition hover:brightness-105 active:scale-[0.98] md:px-3.5 md:py-1.5 md:text-[11px]"
              >
                <span className="text-[13px] leading-none drop-shadow-[0_0_6px_rgba(125,211,252,0.7)]" aria-hidden>
                  ✨
                </span>
                <span>AI ค้นหาแบบบ้าน</span>
              </button>
            </div>

            <div className="mt-1.5 flex flex-wrap gap-1 md:mt-1">
              {suggestions.map((hint) => (
                <button
                  key={hint}
                  type="button"
                  onClick={() => {
                    setQuery(hint);
                    launchAi(hint);
                  }}
                  className="rounded-full border border-[#1A2744]/10 bg-white px-2 py-0.5 text-left text-[10px] font-medium text-[#1A2744]/80 transition hover:border-[#1e40af]/35 hover:bg-[#1e40af]/[0.04] hover:text-[#1e40af]"
                >
                  {hint}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
