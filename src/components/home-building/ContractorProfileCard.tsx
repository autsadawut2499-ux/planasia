"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Phone } from "lucide-react";
import type { HomeBuilder } from "@/lib/home-building/types";

interface ContractorProfileCardProps {
  builder: HomeBuilder;
}

function lineHref(lineId: string): string {
  const raw = lineId.trim();
  if (!raw) return "#";
  if (raw.startsWith("http")) return raw;
  return `https://line.me/R/ti/p/${encodeURIComponent(raw.replace(/^@/, ""))}`;
}

function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/**
 * Single-card contractor profile — carousel portfolio + identity + call/LINE CTAs.
 */
export function ContractorProfileCard({ builder }: ContractorProfileCardProps) {
  const images = useMemo(
    () =>
      builder.portfolioUrls.length > 0
        ? builder.portfolioUrls
        : [
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
          ],
    [builder.portfolioUrls],
  );

  const [index, setIndex] = useState(0);
  const total = images.length;
  const main = images[index % total];
  const sideA = images[(index + 1) % total];
  const sideB = images[(index + 2) % total];

  useEffect(() => {
    setIndex(0);
  }, [builder.id]);

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const phone = builder.phone.trim();
  const lineId = builder.lineId.trim();

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)]">
      {/* Portfolio collage / carousel */}
      <div className="relative bg-slate-100 p-2 sm:p-2.5">
        <div className="grid grid-cols-[1.55fr_1fr] gap-1.5 sm:gap-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={main}
              alt={`${builder.companyName} portfolio ${index + 1}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md transition hover:bg-white"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md transition hover:bg-white"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </div>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
              {images.slice(0, 5).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index % Math.min(5, total)
                      ? "w-3.5 bg-white"
                      : "w-1.5 bg-white/55"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-rows-2 gap-1.5 sm:gap-2">
            <div className="relative overflow-hidden rounded-xl bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sideA}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="relative overflow-hidden rounded-xl bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sideB}
                alt=""
                className="h-full w-full object-cover"
              />
              {total > 1 && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next works"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-md"
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
                </button>
              )}
            </div>
          </div>
        </div>
        <p className="mt-2 text-center text-xs font-medium text-slate-500">
          ผลงานที่ {index + 1}/{total}
        </p>
      </div>

      {/* Identity */}
      <div className="px-5 pb-5 pt-4 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
          {builder.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={builder.logoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg font-black text-[#1A2744]">
              {builder.companyName.slice(0, 1)}
            </span>
          )}
        </div>

        <h3 className="mt-3 text-base font-bold leading-snug text-slate-900 sm:text-lg">
          {builder.companyName}
        </h3>
        {builder.expertise && (
          <p className="mt-1 text-sm text-slate-600">{builder.expertise}</p>
        )}
        <p className="mt-2 text-xs text-slate-500 sm:text-sm">
          พื้นที่: {builder.serviceAreas || "—"}
          <span className="mx-1.5 text-slate-300">|</span>
          ประสบการณ์ {builder.yearsExperience} ปี
        </p>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-2.5 border-t border-slate-100 px-4 py-4 sm:gap-3 sm:px-5">
        {phone ? (
          <a
            href={phoneHref(phone)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0f5c4c] px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c4a3e]"
          >
            <Phone className="h-4 w-4 shrink-0" strokeWidth={2.25} />
            <span className="truncate">โทร: {phone}</span>
          </a>
        ) : (
          <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-200 text-sm text-slate-500">
            ไม่มีเบอร์โทร
          </span>
        )}

        {lineId ? (
          <a
            href={lineHref(lineId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#06C755] px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#05b34c]"
          >
            <LineIcon className="h-4 w-4 shrink-0" />
            <span>ติดต่อ LINE</span>
          </a>
        ) : (
          <span className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-200 text-sm text-slate-500">
            ไม่มี LINE
          </span>
        )}
      </div>
    </article>
  );
}

function LineIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386a.63.63 0 01-.63-.629V8.108c0-.347.281-.63.63-.63h2.386c.349 0 .63.283.63.63 0 .348-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016a.63.63 0 01-.63-.63V8.108c0-.347.282-.63.63-.63.348 0 .63.283.63.63v4.141a.63.63 0 01-.63.63zm-1.598-.006a.605.605 0 01-.55-.348l-2.14-4.595V12.25a.63.63 0 01-.63.629.63.63 0 01-.63-.629V8.108c0-.347.281-.63.63-.63.255 0 .48.15.575.376l2.14 4.595V8.108c0-.347.282-.63.63-.63.349 0 .63.283.63.63v4.141a.626.626 0 01-.625.624zM6.704 12.88H4.868V8.108c0-.347.281-.63.63-.63.348 0 .63.283.63.63v4.141a.63.63 0 01-.63.63h-.001zM24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.121.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}
