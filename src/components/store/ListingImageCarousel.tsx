"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

/** Primary cover + extra renders, deduped, stable order. */
export function buildListingGalleryUrls(listing: {
  image: string;
  renderUrls?: string[] | null;
}): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of [listing.image, ...(listing.renderUrls ?? [])]) {
    const u = String(url ?? "").trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

interface ListingImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  /** Outer frame classes (aspect / padding). */
  frameClassName?: string;
  imgClassName?: string;
}

export function ListingImageCarousel({
  images,
  alt,
  className = "",
  frameClassName = "relative aspect-[4/3] touch-pan-y bg-slate-50 p-2 sm:aspect-[16/10] sm:p-5 lg:aspect-[4/3]",
  imgClassName = "h-full w-full select-none rounded-lg object-contain sm:rounded-xl",
}: ListingImageCarouselProps) {
  const urls = useMemo(
    () => images.map((u) => String(u ?? "").trim()).filter(Boolean),
    [images],
  );
  const galleryKey = urls.join("|");
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setIndex(0);
  }, [galleryKey]);

  const total = urls.length;
  const safeIndex = total > 0 ? ((index % total) + total) % total : 0;
  const current = urls[safeIndex] ?? "";

  const go = useCallback(
    (delta: number) => {
      if (total <= 1) return;
      setIndex((i) => (i + delta + total) % total);
    },
    [total],
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  if (!current) {
    return (
      <div className={`${frameClassName} ${className}`}>
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
          No image
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${frameClassName} ${className}`}
      role="region"
      aria-roledescription="carousel"
      aria-label={alt}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onTouchStart={(e) => {
        touchStartX.current = e.changedTouches[0]?.clientX ?? null;
        touchStartY.current = e.changedTouches[0]?.clientY ?? null;
      }}
      onTouchEnd={(e) => {
        const startX = touchStartX.current;
        const startY = touchStartY.current;
        touchStartX.current = null;
        touchStartY.current = null;
        if (startX == null || total <= 1) return;
        const endX = e.changedTouches[0]?.clientX ?? startX;
        const endY = e.changedTouches[0]?.clientY ?? startY ?? 0;
        const dx = endX - startX;
        const dy = endY - (startY ?? endY);
        // Prefer horizontal swipe; ignore mostly-vertical scrolls.
        if (Math.abs(dx) < 36 || Math.abs(dx) < Math.abs(dy)) return;
        go(dx < 0 ? 1 : -1);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current}
        alt={total > 1 ? `${alt} (${safeIndex + 1}/${total})` : alt}
        className={imgClassName}
        draggable={false}
      />

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-700 shadow-md transition active:scale-95 hover:bg-white hover:text-[#1e40af] sm:left-5 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200/80 bg-white/95 text-slate-700 shadow-md transition active:scale-95 hover:bg-white hover:text-[#1e40af] sm:right-5 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-black/40 px-1.5 py-1 backdrop-blur-sm sm:bottom-5 sm:gap-1 sm:px-2.5 sm:py-1.5">
            {urls.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === safeIndex}
                onClick={() => setIndex(i)}
                className="flex h-8 w-8 items-center justify-center sm:h-7 sm:w-7"
              >
                <span
                  className={`block rounded-full transition-all ${
                    i === safeIndex
                      ? "h-2 w-5 bg-white sm:h-1.5 sm:w-4"
                      : "h-2 w-2 bg-white/55 sm:h-1.5 sm:w-1.5"
                  }`}
                />
              </button>
            ))}
          </div>

          <p className="absolute right-2.5 top-2.5 z-10 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm sm:right-5 sm:top-5">
            {safeIndex + 1} / {total}
          </p>
        </>
      )}
    </div>
  );
}
