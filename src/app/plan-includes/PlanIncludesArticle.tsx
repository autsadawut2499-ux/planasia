"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { RichText } from "@/components/content/RichText";
import { useBilingual } from "@/components/landing/useBilingual";
import {
  type PlanIncludesContent,
  DEFAULT_PLAN_INCLUDES,
} from "@/lib/content/plan-includes";

/**
 * Public article: What’s included in a Planasia house-plan package.
 * CMS-driven copy + gallery images with lightbox.
 */
export function PlanIncludesArticle() {
  const L = useBilingual();
  const [content, setContent] = useState<PlanIncludesContent>(DEFAULT_PLAN_INCLUDES);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/plan-includes", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: { content?: PlanIncludesContent }) => {
        if (active && data.content) setContent(data.content);
      })
      .catch(() => {
        /* keep defaults */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const images =
    content.images.length > 0 ? content.images : DEFAULT_PLAN_INCLUDES.images;
  const title = L(content.title.en, content.title.th);
  const intro = L(content.intro.en, content.intro.th);
  const body = L(content.body.en, content.body.th);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(() => {
    setLightboxIndex((i) => (i == null ? i : (i - 1 + images.length) % images.length));
  }, [images.length]);
  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i == null ? i : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  return (
    <div className="page-canvas">
      <LandingHeader />
      <main>
        {/* Hero band */}
        <section className="border-b border-border/70 bg-gradient-to-b from-[#eef2f7] to-transparent">
          <div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
            <nav className="mb-5 flex items-center gap-1.5 text-xs text-text-muted">
              <Link href="/" className="hover:text-[#1e40af]">
                {L("Home", "หน้าแรก")}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-text-secondary">{title}</span>
            </nav>

            {loading ? (
              <div className="space-y-3">
                <div className="h-10 max-w-md animate-pulse rounded-lg bg-surface-raised" />
                <div className="h-5 max-w-2xl animate-pulse rounded bg-surface-raised" />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-[#1e3a5f] md:text-4xl lg:text-[2.75rem]">
                  {title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-text-secondary md:text-lg">
                  {intro}
                </p>
              </>
            )}
          </div>
        </section>

        {!loading && (
          <>
            {/* Article */}
            <section className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
              <article>
                <RichText html={body} />
              </article>
            </section>

            {/* Gallery */}
            {images.length > 0 && (
              <section className="border-t border-border/70 bg-surface-raised/40">
                <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
                  <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-2xl font-semibold text-[#2b3a4a] md:text-3xl">
                      {L("Preview gallery", "แกลเลอรีตัวอย่าง")}
                    </h2>
                    <p className="mt-2 text-sm text-text-muted md:text-base">
                      {L(
                        "Floor plans, concept views, and sample sheets — click any image to zoom.",
                        "แปลนพื้น ภาพคอนเซ็ปต์ และแผ่นงานตัวอย่าง — คลิกภาพเพื่อขยายดูรายละเอียด",
                      )}
                    </p>
                  </div>

                  <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                    {images.map((url, i) => (
                      <button
                        key={`${url}-${i}`}
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-white shadow-sm outline-none transition hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#1e40af]/50"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={L(`Plan sample ${i + 1}`, `ตัวอย่างแบบ ${i + 1}`)}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          loading={i < 4 ? "eager" : "lazy"}
                          decoding="async"
                        />
                        <span className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/45 via-transparent to-transparent p-2.5 opacity-0 transition group-hover:opacity-100">
                          <span className="rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                            {i + 1} / {images.length}
                          </span>
                          <Expand className="h-4 w-4 text-white drop-shadow" aria-hidden />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* CTA */}
            <section className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-16">
              <div className="rounded-2xl border border-border bg-[var(--color-card,#fff)] p-8 text-center shadow-sm md:p-10">
                <h2 className="text-xl font-semibold text-[#1e3a5f]">
                  {L("Ready to browse house plans?", "พร้อมดูแบบบ้านแล้วหรือยัง?")}
                </h2>
                <p className="mt-2 text-sm text-text-secondary">
                  {L(
                    "Explore ready-to-build plans and download after purchase.",
                    "เลือกชมแบบบ้านพร้อมสร้าง และดาวน์โหลดได้ทันทีหลังชำระเงิน",
                  )}
                </p>
                <Link
                  href="/store"
                  className="mt-5 inline-block rounded-md bg-[#1e40af] px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1e3a8a]"
                >
                  {L("Browse House Plans", "ดูแบบบ้านทั้งหมด")}
                </Link>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Lightbox */}
      {lightboxIndex != null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-black/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={L("Image viewer", "ดูรูปภาพ")}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="text-sm font-medium">
              {lightboxIndex + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={closeLightbox}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
              aria-label={L("Close", "ปิด")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8">
            {images.length > 1 && (
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-6"
                aria-label={L("Previous", "ก่อนหน้า")}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIndex]}
              alt={L(
                `Plan sample ${lightboxIndex + 1}`,
                `ตัวอย่างแบบ ${lightboxIndex + 1}`,
              )}
              className="max-h-[min(85vh,900px)] max-w-full object-contain"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-6"
                aria-label={L("Next", "ถัดไป")}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
