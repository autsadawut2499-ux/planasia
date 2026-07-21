import type { ExportJob, ExportJobFormat } from "@/lib/jobs/types";
import { getSupabaseAdmin } from "@/lib/supabase/client";

interface ExportJobRow {
  id: string;
  status: ExportJob["status"];
  format: ExportJobFormat;
  plan_id: string;
  token: string;
  unit_system: ExportJob["unitSystem"];
  progress: number;
  queue_position: number;
  error: string | null;
  result_filename: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

function rowToJob(row: ExportJobRow): ExportJob {
  return {
    id: row.id,
    status: row.status,
    format: row.format,
    planId: row.plan_id,
    token: row.token,
    unitSystem: row.unit_system,
    progress: row.progress,
    queuePosition: row.queue_position,
    error: row.error ?? undefined,
    resultFilename: row.result_filename ?? undefined,
    createdAt: row.created_at,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
  };
}

function jobToRow(job: ExportJob): ExportJobRow {
  return {
    id: job.id,
    status: job.status,
    format: job.format,
    plan_id: job.planId,
    token: job.token,
    unit_system: job.unitSystem,
    progress: job.progress,
    queue_position: job.queuePosition,
    error: job.error ?? null,
    result_filename: job.resultFilename ?? null,
    created_at: job.createdAt,
    started_at: job.startedAt ?? null,
    completed_at: job.completedAt ?? null,
  };
}

export async function saveExportJob(job: ExportJob): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("export_jobs")
    .upsert(jobToRow(job), { onConflict: "id" });
  if (error) throw error;
}

export async function loadExportJob(id: string): Promise<ExportJob | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("export_jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToJob(data as ExportJobRow) : null;
}

export async function enqueueExportJobId(id: string): Promise<number> {
  const { count, error: countError } = await getSupabaseAdmin()
    .from("export_jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "queued");
  if (countError) throw countError;
  return (count ?? 0) + 1;
}

export async function dequeueExportJobId(): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("export_jobs")
    .select("id")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function getExportQueuePosition(jobId: string): Promise<number> {
  const job = await loadExportJob(jobId);
  if (!job || job.status !== "queued") return 0;

  const { data, error } = await getSupabaseAdmin()
    .from("export_jobs")
    .select("id, created_at")
    .eq("status", "queued")
    .order("created_at", { ascending: true });
  if (error) throw error;

  const idx = (data ?? []).findIndex((row) => row.id === jobId);
  return idx === -1 ? 0 : idx + 1;
}

export async function refreshExportQueuePositions(): Promise<void> {
  const { data, error } = await getSupabaseAdmin()
    .from("export_jobs")
    .select("id")
    .eq("status", "queued")
    .order("created_at", { ascending: true });
  if (error) throw error;

  for (let i = 0; i < (data ?? []).length; i++) {
    const job = await loadExportJob(data![i].id);
    if (job && job.status === "queued") {
      job.queuePosition = i + 1;
      await saveExportJob(job);
    }
  }
}

export async function exportResultExists(
  jobId: string,
  format: ExportJobFormat,
): Promise<boolean> {
  const { data, error } = await getSupabaseAdmin()
    .from("export_job_results")
    .select("job_id")
    .eq("job_id", jobId)
    .eq("format", format)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function readExportResult(
  jobId: string,
  format: ExportJobFormat,
): Promise<Buffer> {
  const { data, error } = await getSupabaseAdmin()
    .from("export_job_results")
    .select("content")
    .eq("job_id", jobId)
    .eq("format", format)
    .maybeSingle();
  if (error) throw error;
  if (!data?.content) throw new Error("Export result not found");

  const raw = data.content as string | Buffer;
  if (Buffer.isBuffer(raw)) return raw;
  return Buffer.from(raw, "base64");
}

export async function writeExportResult(
  jobId: string,
  format: ExportJobFormat,
  payload: Buffer | Uint8Array | string,
): Promise<void> {
  const buf =
    typeof payload === "string" ? Buffer.from(payload, "utf-8") : Buffer.from(payload);

  const { error } = await getSupabaseAdmin()
    .from("export_job_results")
    .upsert(
      {
        job_id: jobId,
        format,
        content: buf.toString("base64"),
      },
      { onConflict: "job_id,format" },
    );
  if (error) throw error;
}
