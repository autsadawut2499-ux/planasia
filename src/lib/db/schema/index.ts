export type {
  ProjectType,
  ProjectTypeCode,
  LocalizedString,
  PROJECT_TYPE_CODES,
} from "./project-types";
export { projectTypeLabel } from "./project-types";

export type {
  BuildingSpecifications,
  FireSafetyComplianceLevel,
} from "./building-specifications";
export {
  DEFAULT_STRUCTURAL_SYSTEMS,
  DEFAULT_LOAD_CAPACITY,
  DEFAULT_FIRE_SAFETY,
} from "./building-specifications";

export type {
  CostBenchmark,
  CostBenchmarkRegion,
  CostLookupParams,
} from "./cost-benchmarks";

export type {
  PermitRule,
  PermitRuleCategory,
  PermitRuleCondition,
  PermitComplianceResult,
  PermitComplianceReport,
} from "./permit-rules";

import type { ProjectInput } from "@/lib/ai/types";
import type { BuildingSpecifications } from "./building-specifications";
import type { ProjectTypeCode } from "./project-types";

/** Full project record combining user input + engineering parameters. */
export interface ProjectRecord {
  id: string;
  projectTypeCode: ProjectTypeCode;
  input: ProjectInput;
  buildingSpec: BuildingSpecifications;
  createdAt: string;
  updatedAt: string;
}

/** Database catalog bundle (reference tables). */
export interface CatalogBundle {
  projectTypes: import("./project-types").ProjectType[];
  costBenchmarks: import("./cost-benchmarks").CostBenchmark[];
  permitRules: import("./permit-rules").PermitRule[];
  schemaVersion: number;
  loadedAt: string;
}
