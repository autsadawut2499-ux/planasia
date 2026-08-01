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

const BRANDS: BrandMark[] = [
  {
    id: "aura-living",
    name: "AURA LIVING",
    className: "brand-mark brand-mark--aura",
  },
  {
    id: "kronos-steel",
    name: "KRONOS STEEL",
    className: "brand-mark brand-mark--kronos",
  },
  {
    id: "lumina-glass",
    name: "LUMINA GLASS",
    className: "brand-mark brand-mark--lumina",
  },
  {
    id: "vanguard",
    name: "VANGUARD",
    className: "brand-mark brand-mark--vanguard",
  },
  {
    id: "terracraft",
    name: "TERRACRAFT",
    className: "brand-mark brand-mark--terracraft",
    parts: [
      { text: "TERRA", className: "brand-mark__terra" },
      { text: "CRAFT", className: "brand-mark__craft" },
    ],
  },
  {
    id: "zenith-spatial",
    name: "ZENITH SPATIAL",
    className: "brand-mark brand-mark--zenith",
  },
  {
    id: "nox-acoustics",
    name: "NOX ACOUSTICS",
    className: "brand-mark brand-mark--nox",
  },
  {
    id: "solaria-energy",
    name: "SOLARIA ENERGY",
    className: "brand-mark brand-mark--solaria",
  },
  {
    id: "atrium-green",
    name: "ATRIUM GREEN",
    className: "brand-mark brand-mark--atrium",
  },
  {
    id: "apex-timber",
    name: "APEX TIMBER",
    className: "brand-mark brand-mark--apex",
  },
];

/** Pixels per second — steady, readable cruise. */
const SPEED_PX_PER_SEC = 42;

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
