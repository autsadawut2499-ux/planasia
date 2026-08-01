import type { DrawingIndexEntry } from "@/lib/plans/schema";
import type { SheetRenderer } from "@/lib/pdf/renderers/types";
import { registryEntryForIndex } from "@/lib/pdf/sheet-registry";
import { a0IndexRenderer } from "@/lib/pdf/renderers/a0-index";
import { a1SitePlanRenderer } from "@/lib/pdf/renderers/a1-site-plan";
import { a2FloorPlanRenderer } from "@/lib/pdf/renderers/a2-floor-plan";
import { a3RoofPlanRenderer } from "@/lib/pdf/renderers/a3-roof-plan";
import { a4ElevationsRenderer } from "@/lib/pdf/renderers/a4-elevations";
import { a5SectionsRenderer } from "@/lib/pdf/renderers/a5-sections";
import { a6A9DetailsRenderer } from "@/lib/pdf/renderers/a6-a9-details";
import { sStructuralRenderer } from "@/lib/pdf/renderers/s-structural";
import { snSanitaryRenderer } from "@/lib/pdf/renderers/sn-sanitary";
import { eElectricalRenderer } from "@/lib/pdf/renderers/e-electrical";
import { acHvacRenderer, meMechanicalRenderer } from "@/lib/pdf/renderers/me-mep";

/** All registered sheet renderers — add/replace here as each drawing type is implemented. */
export const SHEET_RENDERERS: SheetRenderer[] = [
  a0IndexRenderer,
  a1SitePlanRenderer,
  a2FloorPlanRenderer,
  a3RoofPlanRenderer,
  a4ElevationsRenderer,
  a5SectionsRenderer,
  a6A9DetailsRenderer,
  sStructuralRenderer,
  snSanitaryRenderer,
  eElectricalRenderer,
  meMechanicalRenderer,
  acHvacRenderer,
];

const RENDERER_BY_ID = new Map(SHEET_RENDERERS.map((r) => [r.id, r]));

export function resolveRenderer(entry: DrawingIndexEntry): SheetRenderer | null {
  const direct = SHEET_RENDERERS.find((r) => r.matches(entry));
  if (direct) return direct;

  const reg = registryEntryForIndex(entry);
  return RENDERER_BY_ID.get(reg.rendererId) ?? null;
}

export function getRendererById(id: string): SheetRenderer | undefined {
  return RENDERER_BY_ID.get(id);
}

export { a0IndexRenderer, a1SitePlanRenderer, a2FloorPlanRenderer, a3RoofPlanRenderer };
export { a4ElevationsRenderer, a5SectionsRenderer, a6A9DetailsRenderer };
export { sStructuralRenderer, snSanitaryRenderer, eElectricalRenderer };
export { meMechanicalRenderer, acHvacRenderer };
