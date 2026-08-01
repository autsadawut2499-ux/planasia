/**
 * Authoritative drawing standards for Titan Box / Planasia.
 *
 * ROLE SPLIT (mandatory):
 * - Platform: establish DPT layout standards, Titan Box title block refs, project data schema,
 *   per-sheet vector specs, and export orchestration.
 * - External AI agent (via API): generate actual pure-vector drawing geometry per specs.
 *
 * STRICT REFERENCE POLICY:
 * - All construction & drawing LAYOUTS → DPT Golden Standard (Smart A TYPE E)
 * - All TITLE BLOCKS → Titan Box STANDARD-TITLE-BLOCK.dwg + STANDARD-TITLE-BLOCK.plt
 */
import { DPT_STANDARD, DPT_SCALES, DPT_SHEET } from "@/lib/pdf/dpt-standards";
import {
  TITAN_BOX_DWG_FILENAME,
  TITAN_BOX_PLT_FILENAME,
  listRegisteredTitleBlockReferences,
} from "@/lib/pdf/title-block/references";
import {
  buildStandardsBundle,
  getStandardsManifest,
  getSheetVectorSpecs,
} from "@/lib/standards/vector-spec-loader";
import {
  buildTemplateBlocksContext,
  getTemplateBlocksManifest,
  listTemplateBlockIds,
} from "@/lib/standards/template-blocks-loader";

export const VECTOR_GENERATION_ROLE = {
  platform: "prepare-standards-and-data",
  externalAgent: "generate-vector-geometry",
  note: "Planasia does NOT implement full sheet vector geometry. External agents consume specs from templates/standards/.",
} as const;

export const DRAWING_LAYOUT_AUTHORITY = {
  id: DPT_STANDARD.id,
  name: DPT_STANDARD.name,
  nameTh: DPT_STANDARD.nameTh,
  modelType: DPT_STANDARD.modelType,
  sheetSize: DPT_STANDARD.sheetSize,
  orientation: DPT_STANDARD.orientation,
  disciplines: DPT_STANDARD.disciplines,
  goldenStandardJson: "templates/cad/golden-standard.json",
  scales: DPT_SCALES,
} as const;

export const TITLE_BLOCK_AUTHORITY = {
  platform: "Titan Box",
  cadMaster: TITAN_BOX_DWG_FILENAME,
  pdfPlotReference: TITAN_BOX_PLT_FILENAME,
  vectorTemplate: "templates/title-block/titan-box-standard.json",
  manifest: "templates/title-block/manifest.json",
  sheetDimensions: {
    widthPt: DPT_SHEET.widthPt,
    heightPt: DPT_SHEET.heightPt,
    orientation: "landscape" as const,
  },
} as const;

export const STANDARDS_CONFIG_PATHS = {
  manifest: "templates/standards/manifest.json",
  externalAgentContract: "templates/standards/external-agent-contract.json",
  vectorOutputSpec: "templates/standards/vector-output-spec.json",
  sheetVectorSpecs: "templates/standards/sheet-vector-specs.json",
  templateBlocks: "templates/standards/template-blocks/manifest.json",
} as const;

export const STANDARDS_API = {
  bundle: "/api/standards/drawing-spec",
  sheetSpec: (sheet: string) => `/api/standards/drawing-spec?sheet=${encodeURIComponent(sheet)}`,
  agentPayload: "/api/standards/vector-generation",
} as const;

/** AI + export pipeline — mandatory standards block (include in all plan generation prompts). */
export function buildDrawingStandardsContext(): string {
  const manifest = getStandardsManifest();
  const delegatedCount = getSheetVectorSpecs().specs.filter(
    (s) => s.generationStatus === "delegated-to-external-agent",
  ).length;

  return `STRICT DRAWING STANDARDS (mandatory — do not deviate):

1. CONSTRUCTION & DRAWING LAYOUTS — Department of Public Works and Town & Country Planning (DPT)
   - Authority: ${DRAWING_LAYOUT_AUTHORITY.name} (${DRAWING_LAYOUT_AUTHORITY.modelType})
   - Sheet index, disciplines, scales, and sheet codes MUST follow the DPT Golden Standard
   - Config: ${DRAWING_LAYOUT_AUTHORITY.goldenStandardJson}
   - Disciplines: ${DRAWING_LAYOUT_AUTHORITY.disciplines.join(", ")}
   - Sheet size: ${DRAWING_LAYOUT_AUTHORITY.sheetSize} ${DRAWING_LAYOUT_AUTHORITY.orientation}
   - Typical scales: site ${DPT_SCALES.sitePlan}, plans ${DPT_SCALES.floorPlan}, details ${DPT_SCALES.detail}

2. TITLE BLOCKS — Titan Box standard reference files ONLY
   - CAD master: ${TITLE_BLOCK_AUTHORITY.cadMaster} (field layout & geometry)
   - PDF plot reference: ${TITLE_BLOCK_AUTHORITY.pdfPlotReference} (visual PDF standard)
   - Vector template: ${TITLE_BLOCK_AUTHORITY.vectorTemplate}
   - Every sheet uses the Titan Box title block with auto-filled project data
   - Fields: project name, owner, location, architect/engineer, sheet no., title, scale, date, drawn/checked/approved, revision

3. VECTOR GEOMETRY — External agent responsibility
   - Platform prepares specs in ${STANDARDS_CONFIG_PATHS.sheetVectorSpecs} (${delegatedCount} sheet types)
   - Full vector output per ${STANDARDS_CONFIG_PATHS.vectorOutputSpec} (pdf-lib, no raster)
   - API contract: ${STANDARDS_CONFIG_PATHS.externalAgentContract}
   - Standards bundle: ${STANDARDS_API.bundle}

4. STANDARD TEMPLATE BLOCKS — Reusable drawing elements (${listTemplateBlockIds().length} blocks)
   - Config: ${STANDARDS_CONFIG_PATHS.templateBlocks}
   - Line standards, plan skeletons, recurring details, notes, symbols
   ${buildTemplateBlocksContext()}

All generated drawing sets must comply with ALL four areas above.`;
}

export function drawingStandardsComplianceReport(): {
  layout: { authority: string; ok: boolean };
  titleBlock: { references: ReturnType<typeof listRegisteredTitleBlockReferences>; ok: boolean };
  specs: { manifestVersion: string; delegatedSheets: number; platformSheets: number };
  templateBlocks: { count: number; categories: number; ok: boolean };
  compliant: boolean;
} {
  const references = listRegisteredTitleBlockReferences();
  const titleBlockOk = references.every((r) => r.registered);
  const specs = getSheetVectorSpecs();
  const delegatedSheets = specs.specs.filter(
    (s) => s.generationStatus === "delegated-to-external-agent",
  ).length;
  const platformSheets = specs.specs.filter(
    (s) => s.generationStatus === "platform-implemented",
  ).length;

  return {
    layout: { authority: DRAWING_LAYOUT_AUTHORITY.id, ok: true },
    titleBlock: { references, ok: titleBlockOk },
    specs: {
      manifestVersion: getStandardsManifest().version,
      delegatedSheets,
      platformSheets,
    },
    templateBlocks: {
      count: listTemplateBlockIds().length,
      categories: getTemplateBlocksManifest().categories.length,
      ok: true,
    },
    compliant: titleBlockOk,
  };
}

export { buildStandardsBundle };
