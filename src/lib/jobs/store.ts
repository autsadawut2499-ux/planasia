import { randomBytes } from "crypto";
import type { ExportJob, ExportJobFormat } from "@/lib/jobs/types";
import type { UnitSystem } from "@/lib/geo/countries";
import {
  binaryExists,
  readBinary,
  readDocument,
  readQueue,
  writeBinary,
  writeDocument,
  writeQueue,
} from "@/lib/storage/runtime";

const QUEUE_NAME = "jobs/queue.json";
const RESULTS_SUBDIR = "jobs/results";

export function resultPath(jobId: string, format: ExportJobFormat): string {
  const ext = format === "pdf" ? "pdf" : "dxf";
  return `${RESULTS_SUBDIR}/${jobId}.${ext}`;
}

function resultFilename(jobId: string, format: ExportJobFormat): string {
  return `${jobId}.${format === "pdf" ? "pdf" : "dxf"}`;
}

export async function saveJob(job: ExportJob): Promise<void> {
  await writeDocument("jobs", job.id, job);
}

export async function loadJob(id: string): Promise<ExportJob | null> {
  return readDocument<ExportJob>("jobs", id);
}

export async function enqueueJobId(id: string): Promise<number> {
  const queue = await readQueue(QUEUE_NAME);
  queue.push(id);
  await writeQueue(QUEUE_NAME, queue);
  return queue.length;
}

export async function dequeueJobId(): Promise<string | null> {
  const queue = await readQueue(QUEUE_NAME);
  if (queue.length === 0) return null;
  const [next, ...rest] = queue;
  await writeQueue(QUEUE_NAME, rest);
  return next;
}

export async function getQueuePosition(jobId: string): Promise<number> {
  const queue = await readQueue(QUEUE_NAME);
  const idx = queue.indexOf(jobId);
  return idx === -1 ? 0 : idx + 1;
}

export async function refreshQueuePositions(): Promise<void> {
  const queue = await readQueue(QUEUE_NAME);
  for (let i = 0; i < queue.length; i++) {
    const job = await loadJob(queue[i]);
    if (job && job.status === "queued") {
      job.queuePosition = i + 1;
      await saveJob(job);
    }
  }
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
  return binaryExists(RESULTS_SUBDIR, resultFilename(jobId, format));
}

export async function readResult(jobId: string, format: ExportJobFormat): Promise<Buffer> {
  const buf = await readBinary(RESULTS_SUBDIR, resultFilename(jobId, format));
  if (!buf) throw new Error("Export result not found");
  return buf;
}

export async function writeResult(
  jobId: string,
  format: ExportJobFormat,
  data: Buffer | Uint8Array | string,
): Promise<void> {
  await writeBinary(RESULTS_SUBDIR, resultFilename(jobId, format), data);
}
