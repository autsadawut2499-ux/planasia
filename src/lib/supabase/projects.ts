import type { ProjectRecord } from "@/lib/db/schema";
import { getSupabaseAdmin } from "@/lib/supabase/client";

interface ProjectRow {
  id: string;
  project_type_code: string;
  input: ProjectRecord["input"];
  building_spec: ProjectRecord["buildingSpec"];
  created_at: string;
  updated_at: string;
}

function rowToRecord(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    projectTypeCode: row.project_type_code as ProjectRecord["projectTypeCode"],
    input: row.input,
    buildingSpec: row.building_spec,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function recordToRow(record: ProjectRecord): ProjectRow {
  return {
    id: record.id,
    project_type_code: record.projectTypeCode,
    input: record.input,
    building_spec: record.buildingSpec,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

export async function saveProjectRecord(record: ProjectRecord): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("projects")
    .upsert(recordToRow(record), { onConflict: "id" });
  if (error) throw error;
}

export async function loadProjectRecord(id: string): Promise<ProjectRecord | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToRecord(data as ProjectRow) : null;
}
