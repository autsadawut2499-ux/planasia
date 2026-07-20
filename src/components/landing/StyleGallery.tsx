"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { HOUSE_STYLES } from "@/lib/geo/countries";

const STYLE_IMAGES: Record<string, string> = {
  minimal: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  modern: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
  loft: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80",
  nordic: "https://images.unsplash.com/photo-1600047509807-ba8f88d438f0?w=600&q=80",
  contemporary: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
  tropical: "https://images.unsplash.com/photo-1605276374101-ec38c14f68d4?w=600&q=80",
  industrial: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
  japanese: "https://images.unsplash.com/photo-1600585154363-7077a5089932?w=600&q=80",
  scandinavian: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80",
  "tropical-minimal": "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=600&q=80",
};

export function StyleGallery() {
  const { locale, translate } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  return (
    <section id="gallery" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl">
          {translate("gallery.title")}
        </h2>

        <div className="relative">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute -left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-raised shadow-lg transition-colors hover:bg-surface-overlay"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-4 scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {HOUSE_STYLES.map((style) => (
              <div
                key={style.id}
                className="group relative h-72 w-64 shrink-0 overflow-hidden rounded-2xl"
              >
                <img
                  src={STYLE_IMAGES[style.id]}
                  alt={style.label[locale] ?? style.label.en}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  <span className="text-lg font-semibold text-white">
                    {style.label[locale] ?? style.label.en}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute -right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-raised shadow-lg transition-colors hover:bg-surface-overlay"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
