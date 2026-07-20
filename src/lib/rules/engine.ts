import type { PlanOptions, ProjectInput, ValidationResult } from "@/lib/ai/types";
import { buildBuildingSpec } from "@/lib/db/building-spec-factory";
import { validatePermitCompliance } from "@/lib/db/permit-validator";
import { selectCadReferencePatterns } from "@/lib/templates/cad-catalog";

const MAX_BEAM_SPAN_M = 5;

export function validateProject(project: ProjectInput, buildingCode: string): ValidationResult[] {
  const architectural = validateArchitectural(project, buildingCode);
  const structural = validateStructural(project);
  const permit = validatePermitCompliance(buildBuildingSpec(project));

  const permitIssues: ValidationResult["issues"] = permit.results
    .filter((r) => !r.passed)
    .map((r) => ({
      severity: r.severity,
      message: `[${r.ruleCode}] ${r.message}`,
    }));

  architectural.issues.push(...permitIssues);
  architectural.passed =
    architectural.passed && !architectural.issues.some((i) => i.severity === "error");

  return [architectural, structural];
}

export function getPermitCompliance(project: ProjectInput) {
  return validatePermitCompliance(buildBuildingSpec(project));
}

function validateArchitectural(
  project: ProjectInput,
  buildingCode: string,
): ValidationResult {
  const issues: ValidationResult["issues"] = [];

  if (!project.ownerName.trim()) {
    issues.push({
      severity: "warning",
      message: "Owner name missing — required for title block on every sheet",
    });
  }

  if (!project.location.trim()) {
    issues.push({
      severity: "warning",
      message: "Construction location missing — needed for local setback rules",
    });
  }

  if (project.floors === 2 && project.foundation !== "pile") {
    issues.push({
      severity: "error",
      message: `2-floor buildings require pile foundation per ${buildingCode}`,
    });
  }

  return {
    passed: !issues.some((i) => i.severity === "error"),
    issues,
    agent: "architectural",
  };
}

function validateStructural(project: ProjectInput): ValidationResult {
  const issues: ValidationResult["issues"] = [];

  if (project.floors === 2 && project.foundation !== "pile") {
    issues.push({
      severity: "error",
      message: "Structural rule: 2F → pile foundation mandatory",
    });
  }

  issues.push({
    severity: "warning",
    message: `Beam span rule: all spans must be ≤ ${MAX_BEAM_SPAN_M}m (default beam 20×40 cm)`,
  });

  return {
    passed: !issues.some((i) => i.severity === "error"),
    issues,
    agent: "structural",
  };
}

/** Picks PDF reference pattern ID — NOT a Store product. */
export function selectReferencePatternId(project: ProjectInput): string {
  if (project.floors === 1 && project.bedrooms >= 3) return "family3";
  if (project.floors === 1) return "family1";
  if (project.floors === 2 && project.bedrooms >= 4) return "cad-house-2f-4b3ba";
  if (project.floors === 2) return "family4";
  return "family1";
}

/** Picks CAD reference pattern IDs for layer/structure guidance — NOT Store products. */
export function selectCadPatternIds(project: ProjectInput, planOptions: PlanOptions): string[] {
  return selectCadReferencePatterns(project, planOptions).map((p) => p.id);
}
