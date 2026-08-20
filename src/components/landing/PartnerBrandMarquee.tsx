"use client";

import { useEffect, useRef } from "react";

/**
 * Auto-running infinite partner-brand marquee (hero → "แบบบ้านยอดนิยม").
 * Scrolls right → left continuously via requestAnimationFrame — no scrollbar,
 * no drag, no user interaction required.
 */

type BrandMark = {
  id: string;
  name: string;
  className: string;
  parts?: { text: string; className?: string }[];
};

/** Major Thai construction / materials / home-improvement brands. */
const BRANDS: BrandMark[] = [
  { id: "scg", name: "SCG", className: "brand-mark brand-mark--bold" },
  { id: "cpac", name: "CPAC", className: "brand-mark brand-mark--bold" },
  { id: "cotto", name: "COTTO", className: "brand-mark brand-mark--wide" },
  { id: "hafele", name: "HAFELE", className: "brand-mark brand-mark--sans" },
  { id: "toa", name: "TOA", className: "brand-mark brand-mark--bold" },
  { id: "jotun", name: "JOTUN", className: "brand-mark brand-mark--sans" },
  { id: "tostem", name: "TOSTEM", className: "brand-mark brand-mark--wide" },
  {
    id: "bangkok-glass",
    name: "Bangkok Glass (BG)",
    className: "brand-mark brand-mark--split",
    parts: [
      { text: "BG", className: "brand-mark__lead" },
      { text: "BANGKOK GLASS", className: "brand-mark__sub" },
    ],
  },
  { id: "panasonic", name: "Panasonic", className: "brand-mark brand-mark--title" },
  { id: "homepro", name: "HomePro", className: "brand-mark brand-mark--title" },
  { id: "global-house", name: "Global House", className: "brand-mark brand-mark--title" },
  { id: "shera", name: "Shera", className: "brand-mark brand-mark--sans" },
  {
    id: "diamond",
    name: "Diamond (ตราเพชร)",
    className: "brand-mark brand-mark--split",
    parts: [
      { text: "DIAMOND", className: "brand-mark__lead" },
      { text: "ตราเพชร", className: "brand-mark__thai" },
    ],
  },
  { id: "q-con", name: "Q-Con", className: "brand-mark brand-mark--bold" },
  { id: "dos", name: "DOS", className: "brand-mark brand-mark--bold" },
  { id: "beger", name: "Beger", className: "brand-mark brand-mark--title" },
  { id: "mitsubishi", name: "Mitsubishi", className: "brand-mark brand-mark--title" },
  {
    id: "american-standard",
    name: "American Standard",
    className: "brand-mark brand-mark--wide",
  },
  {
    id: "scg-smart-living",
    name: "SCG Smart Living",
    className: "brand-mark brand-mark--title",
  },
  { id: "wha", name: "WHA", className: "brand-mark brand-mark--bold" },
];

/** Pixels per second — slow enough to read brand names comfortably. */
const SPEED_PX_PER_SEC = 26;

function BrandLabel({ brand }: { brand: BrandMark }) {
  if (brand.parts?.length) {
    return (
      <span className={brand.className} aria-label={brand.name}>
        {brand.parts.map((part) => (
          <span key={part.text} className={part.className}>
            {part.text}
          </span>
        ))}
      </span>
    );
  }
  return <span className={brand.className}>{brand.name}</span>;
}

function BrandGroup({ suffix }: { suffix: string }) {
  return (
    <div className="partner-brand-marquee__group">
      {BRANDS.map((brand) => (
        <div key={`${brand.id}-${suffix}`} className="partner-brand-marquee__item">
          <BrandLabel brand={brand} />
        </div>
      ))}
    </div>
  );
}

export function PartnerBrandMarquee({ className = "" }: { className?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    if (!track || !group) return;

    let active = true;

    const tick = (ts: number) => {
      if (!active) return;
      const last = lastTsRef.current ?? ts;
      const deltaSec = Math.min(0.05, (ts - last) / 1000);
      lastTsRef.current = ts;

      const loopWidth = group.offsetWidth;
      if (loopWidth > 0) {
        offsetRef.current += SPEED_PX_PER_SEC * deltaSec;
        if (offsetRef.current >= loopWidth) {
          offsetRef.current -= loopWidth;
        }
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    const onVisibility = () => {
      if (document.hidden) {
        lastTsRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      active = false;
      window.cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section
      aria-label="Partner brands"
      className={`partner-brand-marquee border-b border-neutral-200/80 bg-white ${className}`}
    >
      <ul className="sr-only">
        {BRANDS.map((brand) => (
          <li key={brand.id}>{brand.name}</li>
        ))}
      </ul>
      <div className="partner-brand-marquee__viewport" aria-hidden="true">
        <div ref={trackRef} className="partner-brand-marquee__track">
          <div ref={groupRef} className="partner-brand-marquee__group">
            {BRANDS.map((brand) => (
              <div key={`${brand.id}-a`} className="partner-brand-marquee__item">
                <BrandLabel brand={brand} />
              </div>
            ))}
          </div>
          <BrandGroup suffix="b" />
        </div>
      </div>
    </section>
  );
}
