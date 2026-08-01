import type { ProjectTypeCode, LocalizedString } from "./project-types";

export type PermitRuleCategory =
  | "parking"
  | "fire_safety"
  | "setback"
  | "height"
  | "elevator"
  | "structural"
  | "environmental"
  | "accessibility"
  | "documentation";

export type PermitRuleOperator = "gte" | "gt" | "lte" | "lt" | "eq";

export interface PermitRuleCondition {
  field: string;
  operator: PermitRuleOperator;
  value: number | string | boolean;
}

/** Regulatory row — `permit_rules` table (พ.ร.บ. ควบคุมอาคาร). */
export interface PermitRule {
  id: string;
  projectTypeCode: ProjectTypeCode;
  ruleSetId: string;
  ruleCode: string;
  category: PermitRuleCategory;
  /** e.g. "Building Control Act B.E. 2522 §15" */
  legalReference: string;
  legalReferenceTh: string;
  title: LocalizedString;
  requirement: LocalizedString;
  /** When this rule applies (e.g. floors >= 4) */
  requiredWhen?: PermitRuleCondition;
  /** Field to validate on building_specifications */
  validateField?: string;
  minValue?: number;
  maxValue?: number;
  severity: "error" | "warning";
  /** Documents required for 100% permit submission */
  requiredDocuments?: string[];
  active: boolean;
  sortOrder: number;
}

export interface PermitComplianceResult {
  ruleId: string;
  ruleCode: string;
  passed: boolean;
  severity: "error" | "warning";
  message: string;
  messageTh: string;
  legalReference: string;
}

export interface PermitComplianceReport {
  projectTypeCode: ProjectTypeCode;
  passed: boolean;
  errorCount: number;
  warningCount: number;
  results: PermitComplianceResult[];
  requiredDocuments: string[];
}
