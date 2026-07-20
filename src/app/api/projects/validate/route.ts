import { NextRequest, NextResponse } from "next/server";
import type { ProjectInput } from "@/lib/ai/types";
import { buildBuildingSpec } from "@/lib/db/building-spec-factory";
import { validatePermitCompliance } from "@/lib/db/permit-validator";
import { upsertProjectFromInput } from "@/lib/db/project-repository.server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const project = body.project as ProjectInput;
  const persist = body.persist === true;
  const projectId = body.projectId as string | undefined;

  if (!project) {
    return NextResponse.json({ error: "project required" }, { status: 400 });
  }

  const buildingSpec = buildBuildingSpec(project);
  const permitCompliance = validatePermitCompliance(buildingSpec);

  let record = null;
  if (persist) {
    record = await upsertProjectFromInput({ ...project, buildingSpec }, projectId);
  }

  return NextResponse.json({
    buildingSpec,
    permitCompliance,
    projectRecord: record,
  });
}
