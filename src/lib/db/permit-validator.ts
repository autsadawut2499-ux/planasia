import type { BuildingSpecifications } from "@/lib/db/schema/building-specifications";
import type {
  PermitComplianceReport,
  PermitComplianceResult,
  PermitRule,
  PermitRuleCondition,
} from "@/lib/db/schema/permit-rules";
import { listPermitRules } from "@/lib/db/catalog-store";

function getFieldValue(spec: BuildingSpecifications, field: string): unknown {
  return (spec as unknown as Record<string, unknown>)[field];
}

function evaluateCondition(spec: BuildingSpecifications, cond: PermitRuleCondition): boolean {
  const actual = getFieldValue(spec, cond.field);
  if (actual === undefined) return false;
  switch (cond.operator) {
    case "gte":
      return Number(actual) >= Number(cond.value);
    case "gt":
      return Number(actual) > Number(cond.value);
    case "lte":
      return Number(actual) <= Number(cond.value);
    case "lt":
      return Number(actual) < Number(cond.value);
    case "eq":
      return actual === cond.value;
    default:
      return false;
  }
}

function validateRule(spec: BuildingSpecifications, rule: PermitRule): PermitComplianceResult {
  if (rule.requiredWhen && !evaluateCondition(spec, rule.requiredWhen)) {
    return {
      ruleId: rule.id,
      ruleCode: rule.ruleCode,
      passed: true,
      severity: rule.severity,
      message: "Rule not applicable",
      messageTh: "ไม่เข้าเงื่อนไข",
      legalReference: rule.legalReference,
    };
  }

  let passed = true;
  if (rule.validateField) {
    const val = getFieldValue(spec, rule.validateField);
    if (rule.minValue !== undefined && Number(val) < rule.minValue) passed = false;
    if (rule.maxValue !== undefined && Number(val) > rule.maxValue) passed = false;
    if (val === undefined || val === null || val === "") passed = false;
  }

  if (rule.category === "parking" && rule.projectTypeCode === "commercial") {
    const required = Math.ceil(spec.grossFloorAreaSqm / 30);
    passed = spec.parkingSpaces >= required;
  }
  if (rule.category === "parking" && rule.projectTypeCode === "high_rise") {
    const required = Math.max(2, Math.ceil(spec.grossFloorAreaSqm / 60));
    passed = spec.parkingSpaces >= required;
  }

  if (rule.category === "elevator" && spec.numberOfFloors >= 8) {
    passed = spec.elevatorCount >= 2;
  }

  if (rule.category === "fire_safety" && spec.buildingHeightM >= 23) {
    passed =
      spec.fireSafetyComplianceLevel === "high_rise" ||
      spec.fireSafetyComplianceLevel === "public_assembly";
  }

  return {
    ruleId: rule.id,
    ruleCode: rule.ruleCode,
    passed,
    severity: rule.severity,
    message: passed ? rule.title.en : `Failed: ${rule.requirement.en}`,
    messageTh: passed ? rule.title.th : `ไม่ผ่าน: ${rule.requirement.th}`,
    legalReference: rule.legalReference,
  };
}

/** Run permit_rules compliance against building_specifications. */
export function validatePermitCompliance(spec: BuildingSpecifications): PermitComplianceReport {
  const rules = listPermitRules(spec.projectTypeCode);
  const results = rules.map((r) => validateRule(spec, r));

  const errorCount = results.filter((r) => !r.passed && r.severity === "error").length;
  const warningCount = results.filter((r) => !r.passed && r.severity === "warning").length;

  const docSet = new Set<string>();
  for (const rule of rules) {
    if (rule.requiredDocuments) {
      for (const d of rule.requiredDocuments) docSet.add(d);
    }
  }

  return {
    projectTypeCode: spec.projectTypeCode,
    passed: errorCount === 0,
    errorCount,
    warningCount,
    results,
    requiredDocuments: [...docSet],
  };
}
