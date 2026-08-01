/**
 * Load authoritative standards JSON configs from templates/standards/.
 * Platform role: prepare specs — external agents generate vector geometry.
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { buildTemplateBlocksBundle } from "@/lib/standards/template-blocks-loader";

const STANDARDS_DIR = join(process.cwd(), "templates", "standards");

function loadJson<T>(filename: string): T {
  const path = join(STANDARDS_DIR, filename);
  if (!existsSync(path)) {
    throw new Error(`Standards config not found: ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

export interface StandardsManifest {
  id: string;
  version: string;
  platform: string;
  purpose: string;
  roleSplit: { platform: string[]; externalAgent: string[] };
  authorities: Record<string, unknown>;
  configs: { id: string; path: string; description: string }[];
  apiEndpoints: Record<string, string>;
}

export interface ExternalAgentContract {
  contractVersion: string;
  description: string;
  platformResponsibilities: string[];
  agentResponsibilities: string[];
  requestSchema: Record<string, unknown>;
  responseSchema: Record<string, unknown>;
  authentication: Record<string, string>;
  dispatchModes: Record<string, string>;
}

export interface VectorOutputSpec {
  version: string;
  outputFormat: string;
  library: string;
  rasterAllowed: boolean;
  sheet: Record<string, unknown>;
  coordinateSystem: Record<string, unknown>;
  fonts: Record<string, unknown>;
  lineWeights: Record<string, unknown>;
  colors: Record<string, unknown>;
  primitiveTypes: { type: string; params: string[]; note?: string }[];
  titleBlockIntegration: Record<string, unknown>;
  validation: Record<string, unknown>;
}

export interface SheetVectorSpec {
  rendererId: string;
  sheetCodes: string[];
  discipline: string;
  scopeSectionId: string;
  title: string;
  titleTh: string;
  defaultScale: string;
  dptReferenceFile?: string | null;
  dptReferenceFiles?: Record<string, string | null>;
  autoFillNote?: string;
  requiredElements: string[] | Record<string, string[]>;
  inputDataPaths: string[];
  dataMapping?: Record<string, string>;
  layoutPanels?: Record<string, unknown>;
  referenceFiles?: string[];
  acceptanceCriteria: string[];
  generationStatus: "delegated-to-external-agent" | "platform-implemented";
  generationOwner?: string;
}

export interface SheetVectorSpecsBundle {
  version: string;
  generationOwner: string;
  platformNote: string;
  specs: SheetVectorSpec[];
}

let _manifest: StandardsManifest | null = null;
let _contract: ExternalAgentContract | null = null;
let _outputSpec: VectorOutputSpec | null = null;
let _sheetSpecs: SheetVectorSpecsBundle | null = null;

export function getStandardsManifest(): StandardsManifest {
  if (!_manifest) _manifest = loadJson("manifest.json");
  return _manifest!;
}

export function getExternalAgentContract(): ExternalAgentContract {
  if (!_contract) _contract = loadJson("external-agent-contract.json");
  return _contract!;
}

export function getVectorOutputSpec(): VectorOutputSpec {
  if (!_outputSpec) _outputSpec = loadJson("vector-output-spec.json");
  return _outputSpec!;
}

export function getSheetVectorSpecs(): SheetVectorSpecsBundle {
  if (!_sheetSpecs) _sheetSpecs = loadJson("sheet-vector-specs.json");
  return _sheetSpecs!;
}

export function getSheetSpecByCode(sheetCode: string): SheetVectorSpec | undefined {
  const { specs } = getSheetVectorSpecs();
  return specs.find((s) =>
    s.sheetCodes.some(
      (code) => sheetCode === code || (sheetCode.startsWith("A2.") && code.startsWith("A2.")),
    ),
  );
}

export function getSheetSpecByRenderer(rendererId: string): SheetVectorSpec | undefined {
  return getSheetVectorSpecs().specs.find((s) => s.rendererId === rendererId);
}

export function reloadStandardsConfigs(): void {
  _manifest = null;
  _contract = null;
  _outputSpec = null;
  _sheetSpecs = null;
}

/** Full standards bundle for external AI agents. */
export function buildStandardsBundle() {
  return {
    manifest: getStandardsManifest(),
    contract: getExternalAgentContract(),
    outputSpec: getVectorOutputSpec(),
    sheetSpecs: getSheetVectorSpecs(),
    templateBlocks: buildTemplateBlocksBundle(),
  };
}
