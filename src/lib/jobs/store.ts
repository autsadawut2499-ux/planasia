import { randomBytes } from "crypto";
import type { ExportJob, ExportJobFormat } from "@/lib/jobs/types";
import type { UnitSystem } from "@/lib/geo/countries";
import {
  dequeueExportJobId,
  enqueueExportJobId,
  exportResultExists,
  getExportQueuePosition,
  loadExportJob,
  readExportResult,
  refreshExportQueuePositions,
  saveExportJob,
  writeExportResult,
} from "@/lib/supabase/export-jobs";

export function resultPath(jobId: string, format: ExportJobFormat): string {
  const ext = format === "pdf" ? "pdf" : "dxf";
  return `jobs/results/${jobId}.${ext}`;
}

export async function saveJob(job: ExportJob): Promise<void> {
  await saveExportJob(job);
}

export async function loadJob(id: string): Promise<ExportJob | null> {
  return loadExportJob(id);
}

export async function enqueueJobId(id: string): Promise<number> {
  return enqueueExportJobId(id);
}

export async function dequeueJobId(): Promise<string | null> {
  return dequeueExportJobId();
}

export async function getQueuePosition(jobId: string): Promise<number> {
  return getExportQueuePosition(jobId);
}

export async function refreshQueuePositions(): Promise<void> {
  return refreshExportQueuePositions();
}

export function createJob(params: {
  planId: string;
  token: string;
  format: ExportJobFormat;
  unitSystem: UnitSystem;
  queuePosition: number;
}): ExportJob {
  return {
    id: `job_${randomBytes(12).toString("hex")}`,
    status: "queued",
    format: params.format,
    planId: params.planId,
    token: params.token,
    unitSystem: params.unitSystem,
    progress: 0,
    queuePosition: params.queuePosition,
    createdAt: new Date().toISOString(),
  };
}

export async function resultExists(jobId: string, format: ExportJobFormat): Promise<boolean> {
  return exportResultExists(jobId, format);
}

export async function readResult(jobId: string, format: ExportJobFormat): Promise<Buffer> {
  return readExportResult(jobId, format);
}

export async function writeResult(
  jobId: string,
  format: ExportJobFormat,
  data: Buffer | Uint8Array | string,
): Promise<void> {
  await writeExportResult(jobId, format, data);
}
