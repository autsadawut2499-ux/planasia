import type { ProjectRecord } from "@/lib/db/schema";
import type { BuildingSpecifications } from "@/lib/db/schema/building-specifications";
import type { ProjectInput } from "@/lib/ai/types";
import { buildBuildingSpec } from "@/lib/db/building-spec-factory";
import { readDocument, writeDocument } from "@/lib/storage/runtime";

export function createProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function saveProjectRecord(record: ProjectRecord): Promise<void> {
  await writeDocument("projects", record.id, record);
}

export async function loadProjectRecord(id: string): Promise<ProjectRecord | null> {
  return readDocument<ProjectRecord>("projects", id);
}

export function createProjectRecord(input: ProjectInput, id?: string): ProjectRecord {
  const now = new Date().toISOString();
  const buildingSpec = buildBuildingSpec(input);
  return {
    id: id ?? createProjectId(),
    projectTypeCode: buildingSpec.projectTypeCode,
    buildingSpec,
    input,
    createdAt: now,
    updatedAt: now,
  };
}

export async function upsertProjectFromInput(
  project: ProjectInput & { buildingSpec: BuildingSpecifications },
  id?: string,
): Promise<ProjectRecord> {
  const now = new Date().toISOString();
  const { buildingSpec, ...input } = project;

  if (id) {
    const existing = await loadProjectRecord(id);
    if (existing) {
      const record: ProjectRecord = {
        ...existing,
        projectTypeCode: buildingSpec.projectTypeCode,
        input,
        buildingSpec,
        updatedAt: now,
      };
      await saveProjectRecord(record);
      return record;
    }
  }

  const record: ProjectRecord = {
    id: id ?? createProjectId(),
    projectTypeCode: buildingSpec.projectTypeCode,
    buildingSpec,
    input,
    createdAt: now,
    updatedAt: now,
  };
  await saveProjectRecord(record);
  return record;
}
