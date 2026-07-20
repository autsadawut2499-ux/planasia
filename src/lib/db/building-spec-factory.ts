import type { ProjectInput } from "@/lib/ai/types";
import type { BuildingSpecifications } from "@/lib/db/schema/building-specifications";
import type { ProjectTypeCode } from "@/lib/db/schema/project-types";
import {
  DEFAULT_FIRE_SAFETY,
  DEFAULT_LOAD_CAPACITY,
  DEFAULT_STRUCTURAL_SYSTEMS,
} from "@/lib/db/schema/building-specifications";
import { defaultTargetAreaSqm } from "@/lib/design/budget-targets";
import { getProjectType } from "@/lib/db/catalog-store";

const FLOOR_HEIGHT_M = 3.0;

export function resolveProjectTypeCode(project: ProjectInput): ProjectTypeCode {
  return project.projectTypeCode ?? "residential";
}

/** Build `building_specifications` row from project input + optional overrides. */
export function buildBuildingSpec(
  project: ProjectInput,
  overrides?: Partial<BuildingSpecifications>,
): BuildingSpecifications {
  const code = resolveProjectTypeCode(project);
  const typeMeta = getProjectType(code);
  const floors = project.buildingSpec?.numberOfFloors ?? project.floors ?? typeMeta?.defaultFloors ?? 2;
  const grossArea =
    project.buildingSpec?.grossFloorAreaSqm ??
    project.targetAreaSqm ??
    defaultTargetAreaSqm(project);

  const spec: BuildingSpecifications = {
    projectTypeCode: code,
    numberOfFloors: floors,
    basementFloors: project.buildingSpec?.basementFloors ?? 0,
    grossFloorAreaSqm: grossArea,
    loadBearingCapacityKnSqm:
      project.buildingSpec?.loadBearingCapacityKnSqm ?? DEFAULT_LOAD_CAPACITY[code],
    elevatorCount: project.buildingSpec?.elevatorCount ?? defaultElevators(code, floors),
    fireSafetyComplianceLevel:
      project.buildingSpec?.fireSafetyComplianceLevel ?? DEFAULT_FIRE_SAFETY[code],
    parkingSpaces: project.buildingSpec?.parkingSpaces ?? defaultParking(code, grossArea),
    structuralSystem: project.buildingSpec?.structuralSystem ?? DEFAULT_STRUCTURAL_SYSTEMS[code],
    floorToFloorHeightM: project.buildingSpec?.floorToFloorHeightM ?? FLOOR_HEIGHT_M,
    buildingHeightM: floors * FLOOR_HEIGHT_M,
    bedrooms: project.bedrooms,
    bathrooms: project.bathrooms,
    updatedAt: new Date().toISOString(),
    ...overrides,
  };

  return spec;
}

function defaultElevators(code: ProjectTypeCode, floors: number): number {
  if (code === "high_rise" || floors >= 4) {
    return Math.max(1, Math.ceil(floors / 4));
  }
  if (code === "commercial" && floors >= 4) return 1;
  return 0;
}

function defaultParking(code: ProjectTypeCode, gfa: number): number {
  if (code === "residential") return Math.max(1, Math.ceil(gfa / 80));
  if (code === "commercial") return Math.max(1, Math.ceil(gfa / 30));
  if (code === "high_rise") return Math.max(2, Math.ceil(gfa / 60));
  if (code === "warehouse") return Math.max(2, Math.ceil(gfa / 200));
  return 1;
}

export function mergeBuildingSpecIntoProject(
  project: ProjectInput,
  patch: Partial<BuildingSpecifications>,
): ProjectInput {
  const base = buildBuildingSpec(project);
  return {
    ...project,
    projectTypeCode: patch.projectTypeCode ?? base.projectTypeCode,
    buildingSpec: { ...base, ...patch, updatedAt: new Date().toISOString() },
    targetAreaSqm: patch.grossFloorAreaSqm ?? project.targetAreaSqm,
    floors: Math.min(2, patch.numberOfFloors ?? project.floors) as 1 | 2,
  };
}
