import { NextRequest, NextResponse } from "next/server";
import { findValidGrant } from "@/lib/payments/tokens";
import { createJob, saveJob } from "@/lib/jobs/store";
import { enqueueExportJob } from "@/lib/jobs/processor";
import type { ExportJobFormat } from "@/lib/jobs/types";
import { resolveUnitSystem } from "@/lib/units/format";
import type { UnitSystem } from "@/lib/geo/countries";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token = body.token as string | undefined;
  const format = body.format as ExportJobFormat | undefined;
  const unitSystem = resolveUnitSystem(
    body.unitSystem as UnitSystem | undefined,
    body.countryCode as string | undefined,
  );

  if (!token || !format || (format !== "pdf" && format !== "cad")) {
    return NextResponse.json({ error: "Missing token or format" }, { status: 400 });
  }

  const grant = await findValidGrant(token);
  if (!grant) {
    return NextResponse.json({ error: "Invalid or expired download token" }, { status: 403 });
  }
  if (grant.format !== format) {
    return NextResponse.json({ error: "Token format mismatch" }, { status: 403 });
  }

  const job = createJob({
    planId: grant.planId,
    token,
    format,
    unitSystem,
    queuePosition: 0,
  });
  await saveJob(job);
  const enqueued = await enqueueExportJob(job);

  return NextResponse.json({
    job_id: enqueued.id,
    status: enqueued.status,
    queue_position: enqueued.queuePosition,
    progress: enqueued.progress,
  });
}
