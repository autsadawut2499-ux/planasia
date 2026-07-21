import type { ExportJob } from "@/lib/jobs/types";
import {
  dequeueJobId,
  enqueueJobId,
  getQueuePosition,
  loadJob,
  refreshQueuePositions,
  saveJob,
  writeResult,
} from "@/lib/jobs/store";
import { findValidGrant } from "@/lib/payments/tokens";
import { loadPlanDocument } from "@/lib/plans/store";
import { generatePlanPdf } from "@/lib/pdf/generator";
import { generatePlanDxf } from "@/lib/cad/generator";

let processing = false;

async function processJob(jobId: string): Promise<void> {
  const job = await loadJob(jobId);
  if (!job || job.status !== "queued") return;

  job.status = "processing";
  job.startedAt = new Date().toISOString();
  job.progress = 10;
  job.queuePosition = 0;
  await saveJob(job);

  try {
    const grant = await findValidGrant(job.token);
    if (!grant || grant.planId !== job.planId || grant.format !== job.format) {
      throw new Error("Invalid or expired download token");
    }

    const plan = await loadPlanDocument(job.planId);
    if (!plan) throw new Error("Plan not found");

    job.progress = 40;
    await saveJob(job);

    const opts = { unitSystem: job.unitSystem };
    const baseName = `${plan.project.projectName || "house-plan"}-${job.planId}`;

    if (job.format === "pdf") {
      job.progress = 60;
      await saveJob(job);
      const bytes = await generatePlanPdf(plan, opts);
      await writeResult(job.id, "pdf", bytes);
      job.resultFilename = `${baseName}.pdf`;
    } else {
      job.progress = 60;
      await saveJob(job);
      const dxf = generatePlanDxf(plan, opts);
      await writeResult(job.id, "cad", dxf);
      job.resultFilename = `${baseName}.dxf`;
    }

    job.status = "completed";
    job.progress = 100;
    job.completedAt = new Date().toISOString();
    await saveJob(job);
  } catch (err) {
    job.status = "failed";
    job.error = err instanceof Error ? err.message : "Export failed";
    job.completedAt = new Date().toISOString();
    await saveJob(job);
  }
}

/** Drain FIFO queue — one job at a time per runtime instance. */
export async function drainExportQueue(): Promise<void> {
  if (processing) return;
  processing = true;
  try {
    for (;;) {
      const nextId = await dequeueJobId();
      if (!nextId) break;
      await processJob(nextId);
      await refreshQueuePositions();
    }
  } finally {
    processing = false;
  }
}

export async function enqueueExportJob(job: ExportJob): Promise<ExportJob> {
  const position = await enqueueJobId(job.id);
  job.queuePosition = position;
  await saveJob(job);
  void drainExportQueue();
  return job;
}

export async function getJobStatus(jobId: string): Promise<ExportJob | null> {
  const job = await loadJob(jobId);
  if (!job) return null;
  if (job.status === "queued") {
    job.queuePosition = await getQueuePosition(job.id);
    await saveJob(job);
  }
  return job;
}
