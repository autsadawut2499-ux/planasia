import type { ProjectInput } from "@/lib/ai/types";
import type { DesignEditorState, EditorExportPayload } from "./editor-types";
import { estimateMaterials } from "./material-estimate";
import { computeCostBalance } from "./cost-balance-engine";
import { budgetTargetsFromProject } from "./budget-targets";
import { validatePermitCompliance } from "@/lib/db/permit-validator";
import { buildBuildingSpec } from "@/lib/db/building-spec-factory";
import type { PermitComplianceReport } from "@/lib/db/schema/permit-rules";
import type { CostBalanceResult } from "./cost-balance-engine";
import { applyEditorToProject } from "./editor-state";

export type DesignExportBundle = EditorExportPayload & {
  costBalance: CostBalanceResult;
  permitCompliance: PermitComplianceReport;
};

export function buildEditorExport(
  editor: DesignEditorState,
  project: ProjectInput,
): DesignExportBundle {
  const mergedProject = applyEditorToProject(project, editor);
  const materialEstimate = estimateMaterials(editor);
  const targets = budgetTargetsFromProject(mergedProject);
  const costBalance = computeCostBalance(editor, targets, mergedProject);
  const buildingSpec = buildBuildingSpec(mergedProject, { grossFloorAreaSqm: costBalance.grossAreaSqm });
  const permitCompliance = validatePermitCompliance(buildingSpec);

  const doorWindowSchedule = editor.openings.map((o) => {
    const room = editor.rooms.find((r) => r.id === o.roomId);
    return {
      id: o.id,
      type: o.type,
      room: room?.name ?? o.roomId,
      wall: o.wall,
      widthM: o.width,
      floor: o.floor,
    };
  });

  return { editorState: editor, project: mergedProject, materialEstimate, doorWindowSchedule, costBalance, permitCompliance };
}
