import type { StoreListing } from "@/lib/store/listing-types";

export interface PlanCardSpec {
  labelEn: string;
  labelTh: string;
  value: string;
}

/** Parse numeric area from strings like "180 sqm" / "180 ตร.ม.". */
export function parseListingAreaNumber(area: string): string {
  const m = area.match(/[\d]+(?:[.,]\d+)?/);
  if (!m) return "—";
  const n = Number(m[0].replace(",", ""));
  if (!Number.isFinite(n)) return m[0];
  return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function formatMeters(value: number | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const n = Number(value);
  return `${n % 1 === 0 ? String(n) : n.toFixed(1)} ม.`;
}

/**
 * Specs for the product card — short labels so 2-row grids stay readable
 * on narrow columns without truncation/overflow.
 * Area · Beds · Baths · Cars · Stories · Width · Depth
 */
export function buildPlanCardSpecs(listing: StoreListing): PlanCardSpec[] {
  return [
    {
      labelEn: "Sq m",
      labelTh: "ตร.ม.",
      value: parseListingAreaNumber(listing.area),
    },
    {
      labelEn: "Beds",
      labelTh: "นอน",
      value: String(listing.beds),
    },
    {
      labelEn: "Baths",
      labelTh: "น้ำ",
      value: String(listing.baths),
    },
    {
      labelEn: "Park",
      labelTh: "จอด",
      value: listing.parking != null ? String(listing.parking) : "—",
    },
    {
      labelEn: "Flrs",
      labelTh: "ชั้น",
      value: String(listing.floors),
    },
    {
      labelEn: "W",
      labelTh: "กว้าง",
      value: formatMeters(listing.widthMeters),
    },
    {
      labelEn: "D",
      labelTh: "ลึก",
      value: formatMeters(listing.lengthMeters),
    },
  ];
}

/** Sale UI when compare-at is higher than the current price. */
export function resolveListingSale(listing: StoreListing): {
  price: number;
  compareAt: number | null;
} {
  const price = listing.price;
  const fromField =
    typeof listing.compareAtPrice === "number" ? listing.compareAtPrice : null;
  const fromBreakdown =
    typeof listing.priceBreakdown?.compareAt === "number"
      ? listing.priceBreakdown.compareAt
      : null;
  const compareAt = fromField ?? fromBreakdown;
  if (compareAt != null && compareAt > price) {
    return { price, compareAt };
  }
  return { price, compareAt: null };
}
