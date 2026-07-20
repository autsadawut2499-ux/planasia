import type { Locale } from "@/lib/geo/countries";

/** Canonical building category codes — maps to `project_types` table. */
export type ProjectTypeCode = "residential" | "commercial" | "warehouse" | "high_rise";

export interface LocalizedString {
  en: string;
  th: string;
  hi?: string;
  vi?: string;
}

export interface ProjectType {
  id: string;
  code: ProjectTypeCode;
  name: LocalizedString;
  description: LocalizedString;
  /** Default floor count for new projects of this type */
  defaultFloors: number;
  maxFloors: number;
  allowsBasement: boolean;
  structuralSystemOptions: string[];
  applicableBuildingCodes: string[];
  /** Key into cost_benchmarks filter */
  costMatrixKey: ProjectTypeCode;
  /** Permit rule set identifier */
  permitRuleSetId: string;
  icon: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const PROJECT_TYPE_CODES: ProjectTypeCode[] = [
  "residential",
  "commercial",
  "warehouse",
  "high_rise",
];

export function projectTypeLabel(type: ProjectType, locale: Locale): string {
  return type.name[locale] ?? type.name.en;
}
