import { readFile, writeFile, mkdir, access } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import type { ExportJob, ExportJobFormat } from "@/lib/jobs/types";
import type { UnitSystem } from "@/lib/geo/countries";

const JOBS_DIR = path.join(process.cwd(), "data", "jobs");
const RESULTS_DIR = path.join(JOBS_DIR, "results");
const QUEUE_FILE = path.join(JOBS_DIR, "queue.json");

function jobPath(id: string): string {
  return path.join(JOBS_DIR, `${id}.json`);
}

export function resultPath(jobId: string, format: ExportJobFormat): string {
  const ext = format === "pdf" ? "pdf" : "dxf";
  return path.join(RESULTS_DIR, `${jobId}.${ext}`);
}

async function ensureDirs(): Promise<void> {
  await mkdir(JOBS_DIR, { recursive: true });
  await mkdir(RESULTS_DIR, { recursive: true });
}

async function readQueue(): Promise<string[]> {
  try {
    const raw = await readFile(QUEUE_FILE, "utf-8");
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

async function writeQueue(ids: string[]): Promise<void> {
  await ensureDirs();
  await writeFile(QUEUE_FILE, JSON.stringify(ids, null, 2), "utf-8");
}

export async function saveJob(job: ExportJob): Promise<void> {
  await ensureDirs();
  await writeFile(jobPath(job.id), JSON.stringify(job, null, 2), "utf-8");
}

export async function loadJob(id: string): Promise<ExportJob | null> {
  try {
    const raw = await readFile(jobPath(id), "utf-8");
    return JSON.parse(raw) as ExportJob;
  } catch {
    return null;
  }
}

export async function enqueueJobId(id: string): Promise<number> {
  const queue = await readQueue();
  queue.push(id);
  await writeQueue(queue);
  return queue.length;
}

export async function dequeueJobId(): Promise<string | null> {
  const queue = await readQueue();
  if (queue.length === 0) return null;
  const [next, ...rest] = queue;
  await writeQueue(rest);
  return next;
}

export async function getQueuePosition(jobId: string): Promise<number> {
  const queue = await readQueue();
  const idx = queue.indexOf(jobId);
  return idx === -1 ? 0 : idx + 1;
}

export async function refreshQueuePositions(): Promise<void> {
  const queue = await readQueue();
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
  try {
    await access(resultPath(jobId, format));
    return true;
  } catch {
    return false;
  }
}

export async function readResult(jobId: string, format: ExportJobFormat): Promise<Buffer> {
  return readFile(resultPath(jobId, format));
}

export async function writeResult(jobId: string, format: ExportJobFormat, data: Buffer | Uint8Array | string): Promise<void> {
  await ensureDirs();
  const p = resultPath(jobId, format);
  if (typeof data === "string") {
    await writeFile(p, data, "utf-8");
  } else {
    await writeFile(p, Buffer.from(data));
  }
}
