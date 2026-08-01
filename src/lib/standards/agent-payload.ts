/**
 * Build per-sheet payloads for external vector generation agents.
 * Platform prepares data + specs; agent returns vector geometry.
 */
import type { HousePlanDocument } from "@/lib/plans/schema";
import { resolveTitleBlockFields } from "@/lib/pdf/title-block";
import { lookupRegistryEntry } from "@/lib/pdf/sheet-registry";
import {
  DRAWING_LAYOUT_AUTHORITY,
  TITLE_BLOCK_AUTHORITY,
  buildDrawingStandardsContext,
} from "@/lib/standards/drawing-standards";
import {
  getExternalAgentContract,
  getSheetSpecByCode,
  getVectorOutputSpec,
  type SheetVectorSpec,
} from "@/lib/standards/vector-spec-loader";
import { buildTemplateBlocksBundle } from "@/lib/standards/template-blocks-loader";

export interface VectorGenerationPayload {
  contractVersion: string;
  jobId: string;
  sheetCode: string;
  rendererId: string;
  standards: {
    layoutAuthority: typeof DRAWING_LAYOUT_AUTHORITY;
    titleBlockAuthority: typeof TITLE_BLOCK_AUTHORITY;
    outputSpec: ReturnType<typeof getVectorOutputSpec>;
    standardsContext: string;
  };
  projectData: HousePlanDocument;
  sheetSpec: SheetVectorSpec;
  titleBlockFields: ReturnType<typeof resolveTitleBlockFields>;
  referenceFiles: string[];
  indexEntry: HousePlanDocument["index"][number] | undefined;
  templateBlocks: ReturnType<typeof buildTemplateBlocksBundle>;
}

function referenceFilesForSpec(spec: SheetVectorSpec): string[] {
  const base = [
    DRAWING_LAYOUT_AUTHORITY.goldenStandardJson,
    TITLE_BLOCK_AUTHORITY.cadMaster,
    TITLE_BLOCK_AUTHORITY.pdfPlotReference,
    TITLE_BLOCK_AUTHORITY.vectorTemplate,
  ];
  if (spec.referenceFiles) return [...base, ...spec.referenceFiles];
  if (spec.dptReferenceFile) return [...base, `smart-a-golden/${spec.dptReferenceFile}`];
  return base;
}

/** Slice project data relevant to a sheet (agent may use full doc or slice). */
export function projectDataForSheet(doc: HousePlanDocument, sheetCode: string): HousePlanDocument {
  // Full document passed — agent uses sheetSpec.inputDataPaths to locate fields.
  // Future: narrow payload per sheet type to reduce token size.
  void sheetCode;
  return doc;
}

export function buildVectorGenerationPayload(
  doc: HousePlanDocument,
  sheetCode: string,
  jobId: string,
): VectorGenerationPayload | null {
  const sheetSpec = getSheetSpecByCode(sheetCode);
  if (!sheetSpec) return null;

  const registry = lookupRegistryEntry(sheetCode);
  const indexEntry = doc.index.find((e) => e.sheetNo === sheetCode);
  const contract = getExternalAgentContract();

  return {
    contractVersion: contract.contractVersion,
    jobId,
    sheetCode,
    rendererId: registry?.rendererId ?? sheetSpec.rendererId,
    standards: {
      layoutAuthority: DRAWING_LAYOUT_AUTHORITY,
      titleBlockAuthority: TITLE_BLOCK_AUTHORITY,
      outputSpec: getVectorOutputSpec(),
      standardsContext: buildDrawingStandardsContext(),
    },
    projectData: projectDataForSheet(doc, sheetCode),
    sheetSpec,
    titleBlockFields: resolveTitleBlockFields(doc, indexEntry ?? {
      sheetNo: sheetCode,
      title: sheetSpec.title,
      titleTh: sheetSpec.titleTh,
      category: sheetSpec.discipline as HousePlanDocument["index"][number]["category"],
      scale: sheetSpec.defaultScale,
    }),
    referenceFiles: referenceFilesForSpec(sheetSpec),
    indexEntry,
    templateBlocks: buildTemplateBlocksBundle(),
  };
}

/** Build payloads for all sheets delegated to external agent. */
export function buildAllAgentPayloads(
  doc: HousePlanDocument,
  jobId: string,
): VectorGenerationPayload[] {
  const sheets = doc.index.filter((e) => e.sheetNo !== "TB");
  const payloads: VectorGenerationPayload[] = [];

  for (const entry of sheets) {
    const spec = getSheetSpecByCode(entry.sheetNo);
    if (spec?.generationStatus === "delegated-to-external-agent") {
      const payload = buildVectorGenerationPayload(doc, entry.sheetNo, jobId);
      if (payload) payloads.push(payload);
    }
  }

  return payloads;
}
