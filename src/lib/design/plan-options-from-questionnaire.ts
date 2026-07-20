import type { PlanOptions, QuestionnaireInput } from "@/lib/ai/types";
import { DEFAULT_PLAN_OPTIONS } from "@/lib/ai/types";

export function planOptionsFromQuestionnaire(
  questionnaire: QuestionnaireInput,
  base: PlanOptions = DEFAULT_PLAN_OPTIONS,
): PlanOptions {
  const preset = questionnaire.designDirection.disciplinePreset;
  switch (preset) {
    case "architectural":
      return { ...base, includeStructural: false, includePlumbing: false, includeElectrical: false };
    case "arch-structure":
      return { ...base, includePlumbing: false, includeElectrical: false };
    case "arch-mep":
      return { ...base, includeStructural: false };
    default:
      return base;
  }
}
