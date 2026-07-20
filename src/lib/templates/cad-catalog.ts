/**
 * CAD reference pattern catalog — internal templates from professional DWG samples.
 * Files in templates/cad/ are NOT sold on the Store.
 */
import catalog from "../../../templates/cad/index.json";
import type { PlanOptions, ProjectInput } from "@/lib/ai/types";

export type CadDiscipline = "A" | "S" | "SN" | "E" | "ME" | "AC" | "multi";

export interface CadReferencePattern {
  id: string;
  file: string;
  category: string;
  discipline: CadDiscipline;
  forSale: false;
  tags: string[];
  floors?: number;
  bedrooms?: number;
  bathrooms?: number;
  sheetType?: string;
  sizeBytes?: number;
  goldenStandard?: boolean;
}

export interface CadCatalog {
  purpose: string;
  usage: string;
  referencePatterns: CadReferencePattern[];
  disciplineSets: Record<string, string[]>;
}

export const CAD_CATALOG = catalog as CadCatalog;

export function getCadPatternById(id: string): CadReferencePattern | undefined {
  return CAD_CATALOG.referencePatterns.find((p) => p.id === id);
}

export function getCadPatternsByDiscipline(d: CadDiscipline): CadReferencePattern[] {
  return CAD_CATALOG.referencePatterns.filter((p) => p.discipline === d);
}

/** Select best-matching CAD reference patterns for a user+AI project */
export function selectCadReferencePatterns(
  project: ProjectInput,
  planOptions: PlanOptions,
): CadReferencePattern[] {
  const selected: CadReferencePattern[] = [];
  const ids = new Set<string>();

  const add = (id: string) => {
    if (ids.has(id)) return;
    const p = getCadPatternById(id);
    if (p) {
      ids.add(id);
      selected.push(p);
    }
  };

  // Golden Standard Smart A — PRIMARY completeness reference
  for (const id of CAD_CATALOG.disciplineSets.goldenStandard ?? []) {
    add(id);
  }

  // Legacy residential complete set
  for (const id of CAD_CATALOG.disciplineSets.residentialComplete ?? []) {
    add(id);
  }

  // Match by bedrooms/floors
  const residential = CAD_CATALOG.referencePatterns.filter(
    (p) =>
      p.category === "civil-residential" &&
      (p.floors === undefined || p.floors === project.floors) &&
      (p.bedrooms === undefined || Math.abs((p.bedrooms ?? 0) - project.bedrooms) <= 1),
  );
  residential.slice(0, 2).forEach((p) => add(p.id));

  // Airport As-Built per discipline (layer/standard reference)
  if (planOptions.includeStructural) add("cad-airport-s");
  if (planOptions.includePlumbing) add("cad-airport-sn");
  if (planOptions.includeElectrical) add("cad-airport-e");
  add("cad-airport-a");

  add("cad-symbols");
  add("cad-res-titleblock");

  return selected;
}

export function buildCadReferenceContext(patterns: CadReferencePattern[]): string {
  if (patterns.length === 0) return "";
  const lines = patterns.map(
    (p) =>
      `- ${p.id}: ${p.file} [${p.discipline}] ${p.category}${p.sheetType ? ` (${p.sheetType})` : ""}${p.floors ? ` ${p.floors}F` : ""}`,
  );
  return `CAD reference patterns (internal only — do NOT copy verbatim for Store sale):\n${lines.join("\n")}`;
}

export function getCadFilePath(relativeFile: string): string {
  return `templates/cad/${relativeFile.replace(/\\/g, "/")}`;
}
