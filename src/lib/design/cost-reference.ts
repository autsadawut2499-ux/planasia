import type { Locale } from "@/lib/geo/countries";

/** Construction cost tier aligned with Thai REA (สมาคมอสังหาริมทรัพย์ไทย) index bands. */
export type CostTier = "economy" | "standard" | "premium";

export interface TierBenchmark {
  tier: CostTier;
  /** All-in construction cost per usable sqm (THB) — Thailand reference */
  thConstructionPerSqm: number;
  /** International reference (USD/sqm) */
  intlConstructionPerSqmUsd: number;
  label: Record<Locale, string>;
  description: Record<Locale, string>;
}

/** REA-style index bands (2024–2026 Thailand residential reference). */
export const REA_TIER_BENCHMARKS: TierBenchmark[] = [
  {
    tier: "economy",
    thConstructionPerSqm: 14_500,
    intlConstructionPerSqmUsd: 420,
    label: {
      en: "Economy",
      th: "ประหยัด (Economy)",
      hi: "Economy",
      vi: "Tiết kiệm",
    },
    description: {
      en: "Basic finishes, standard materials — REA index band ฿12,000–16,000/m²",
      th: "วัสดุมาตรฐาน งานตกแต่งพื้นฐาน — ดัชนี REA ฿12,000–16,000/ตร.ม.",
      hi: "Basic finishes — REA index band",
      vi: "Hoàn thiện cơ bản — chỉ số REA",
    },
  },
  {
    tier: "standard",
    thConstructionPerSqm: 20_500,
    intlConstructionPerSqmUsd: 590,
    label: {
      en: "Standard",
      th: "มาตรฐาน (Standard)",
      hi: "Standard",
      vi: "Tiêu chuẩn",
    },
    description: {
      en: "Mid-range materials, typical family home — REA index band ฿18,000–23,000/m²",
      th: "วัสดุระดับกลาง บ้านครอบครัวทั่วไป — ดัชนี REA ฿18,000–23,000/ตร.ม.",
      hi: "Mid-range — REA index band",
      vi: "Tầm trung — chỉ số REA",
    },
  },
  {
    tier: "premium",
    thConstructionPerSqm: 31_000,
    intlConstructionPerSqmUsd: 890,
    label: {
      en: "Premium",
      th: "พรีเมียม (Premium)",
      hi: "Premium",
      vi: "Cao cấp",
    },
    description: {
      en: "High-grade finishes, architect-spec — REA index band ฿28,000–35,000/m²",
      th: "วัสดุเกรดสูง งานสpec สถาปนิก — ดัชนี REA ฿28,000–35,000/ตร.ม.",
      hi: "High-grade — REA index band",
      vi: "Cao cấp — chỉ số REA",
    },
  },
];

export function getTierBenchmark(tier: CostTier) {
  return REA_TIER_BENCHMARKS.find((t) => t.tier === tier) ?? REA_TIER_BENCHMARKS[1];
}

/** Material grade multipliers relative to Standard tier baseline. */
export const MATERIAL_GRADE_FACTORS: Record<string, number> = {
  "concrete-block": 0.96,
  brick: 1.0,
  precast: 1.14,
  "ceramic-tile": 0.98,
  granite: 1.22,
  wood: 1.08,
  "concrete-flat": 1.02,
  "metal-sheet": 0.9,
  "clay-tile": 1.12,
};

export const DEFAULT_COST_TIER: CostTier = "standard";
