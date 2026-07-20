import { NextRequest, NextResponse } from "next/server";
import { loadJob, readResult } from "@/lib/jobs/store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = await loadJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.status !== "completed") {
    return NextResponse.json({ error: "Export not ready" }, { status: 409 });
  }

  try {
    const data = await readResult(job.id, job.format);
    const filename = job.resultFilename ?? `planasia-export.${job.format === "pdf" ? "pdf" : "dxf"}`;
    const contentType = job.format === "pdf" ? "application/pdf" : "application/dxf";

    return new NextResponse(Buffer.from(data), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Result file missing" }, { status: 404 });
  }
}
