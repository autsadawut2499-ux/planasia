import { PRICING } from "@/lib/geo/countries";
import type { PlanOptions, ProjectInput } from "@/lib/ai/types";

export interface StorePriceBreakdown {
  base: number;
  floorSurcharge: number;
  bedSurcharge: number;
  bathSurcharge: number;
  optionsSurcharge: number;
  total: number;
  currency: string;
}

/** Dynamic store catalog price from project specs + drawing options. */
export function computeStorePrice(
  project: ProjectInput,
  planOptions?: PlanOptions,
  currency = "THB",
): StorePriceBreakdown {
  const base = PRICING.store.pdf;
  const floorSurcharge = project.floors === 2 ? 400 : 0;
  const bedSurcharge = Math.max(0, project.bedrooms - 2) * 150;
  const bathSurcharge = Math.max(0, project.bathrooms - 2) * 100;

  let optionsSurcharge = 0;
  if (planOptions?.includeStructural) optionsSurcharge += 200;
  if (planOptions?.includeElectrical) optionsSurcharge += 100;
  if (planOptions?.includePlumbing) optionsSurcharge += 100;
  if (planOptions?.evCharger) optionsSurcharge += 150;

  const total = base + floorSurcharge + bedSurcharge + bathSurcharge + optionsSurcharge;

  return {
    base,
    floorSurcharge,
    bedSurcharge,
    bathSurcharge,
    optionsSurcharge,
    total,
    currency,
  };
}

export function formatStorePrice(amount: number, currency: string): string {
  if (currency === "THB") return `฿${amount.toLocaleString()}`;
  return `${currency} ${amount.toLocaleString()}`;
}
