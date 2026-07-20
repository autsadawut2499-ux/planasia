import type { UnitSystem } from "@/lib/geo/countries";

export type JobStatus = "queued" | "processing" | "completed" | "failed";

export type ExportJobFormat = "pdf" | "cad";

export interface ExportJob {
  id: string;
  status: JobStatus;
  format: ExportJobFormat;
  planId: string;
  token: string;
  unitSystem: UnitSystem;
  /** 0–100 processing progress */
  progress: number;
  queuePosition: number;
  error?: string;
  resultFilename?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface EnqueueExportParams {
  token: string;
  format: ExportJobFormat;
  unitSystem?: UnitSystem;
}

export type JobPublicView = Pick<
  ExportJob,
  "id" | "status" | "format" | "progress" | "queuePosition" | "error" | "resultFilename" | "createdAt" | "startedAt" | "completedAt"
>;
