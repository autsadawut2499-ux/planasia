import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import type { ProjectRecord } from "@/lib/db/schema";
import type { ProjectInput } from "@/lib/ai/types";
import { buildBuildingSpec } from "@/lib/db/building-spec-factory";

const PROJECTS_DIR = path.join(process.cwd(), "data", "projects");

async function ensureDir() {
  await mkdir(PROJECTS_DIR, { recursive: true });
}

function projectPath(id: string) {
  return path.join(PROJECTS_DIR, `${id}.json`);
}

export function createProjectId(): string {
  return `proj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function saveProjectRecord(record: ProjectRecord): Promise<void> {
  await ensureDir();
  await writeFile(projectPath(record.id), JSON.stringify(record, null, 2), "utf-8");
}

export async function loadProjectRecord(id: string): Promise<ProjectRecord | null> {
  try {
    const raw = await readFile(projectPath(id), "utf-8");
    return JSON.parse(raw) as ProjectRecord;
  } catch {
    return null;
  }
}

export function createProjectRecord(input: ProjectInput, id?: string): ProjectRecord {
  const now = new Date().toISOString();
  const buildingSpec = buildBuildingSpec(input);
  return {
    id: id ?? createProjectId(),
    projectTypeCode: buildingSpec.projectTypeCode,
    input: { ...input, buildingSpec, projectTypeCode: buildingSpec.projectTypeCode },
    buildingSpec,
    createdAt: now,
    updatedAt: now,
  };
}

export async function upsertProjectFromInput(
  input: ProjectInput,
  existingId?: string,
): Promise<ProjectRecord> {
  const existing = existingId ? await loadProjectRecord(existingId) : null;
  const record = createProjectRecord(input, existing?.id);
  if (existing) {
    record.createdAt = existing.createdAt;
  }
  await saveProjectRecord(record);
  return record;
}
