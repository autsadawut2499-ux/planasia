import { NextRequest, NextResponse } from "next/server";
import { getJobStatus } from "@/lib/jobs/processor";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = await getJobStatus(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    job_id: job.id,
    status: job.status,
    format: job.format,
    progress: job.progress,
    queue_position: job.queuePosition,
    error: job.error,
    result_filename: job.resultFilename,
    created_at: job.createdAt,
    started_at: job.startedAt,
    completed_at: job.completedAt,
    download_url: job.status === "completed" ? `/api/jobs/${job.id}/download` : null,
  });
}
