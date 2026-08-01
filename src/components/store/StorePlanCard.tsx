"use client";

import { HousePlanCard } from "@/components/store/HousePlanCard";
import type { StoreListing } from "@/lib/store/db";

interface StorePlanCardProps {
  item: StoreListing;
  index: number;
}

/** Store grid card — entire card links to the plan detail page. */
export function StorePlanCard({ item, index }: StorePlanCardProps) {
  return <HousePlanCard item={item} index={index} />;
}
