"use client";

const BRAND = "Planasia";

interface DiagonalWatermarkProps {
  /** When false, watermark is hidden (paid/unlocked state) */
  active: boolean;
  className?: string;
}

/** Repeating diagonal text overlay to deter screenshot copying */
export function DiagonalWatermark({ active, className = "" }: DiagonalWatermarkProps) {
  if (!active) return null;

  const tiles = Array.from({ length: 48 }, (_, i) => i);

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 overflow-hidden select-none ${className}`}
      aria-hidden
    >
      <div
        className="absolute left-1/2 top-1/2 grid origin-center"
        style={{
          transform: "translate(-50%, -50%) rotate(-35deg)",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "3rem 4rem",
          width: "200%",
        }}
      >
        {tiles.map((i) => (
          <span
            key={i}
            className="whitespace-nowrap text-center text-lg font-bold uppercase tracking-[0.2em] text-black/12 md:text-xl"
          >
            {BRAND}
          </span>
        ))}
      </div>
    </div>
  );
}
