import { NextRequest, NextResponse } from "next/server";
import { ensureCatalogSeeded, loadCatalog } from "@/lib/db/catalog-store.server";
import {
  listProjectTypes as listTypesSync,
  listCostBenchmarks as listCostsSync,
  listPermitRules as listRulesSync,
} from "@/lib/db/catalog-store";
import type { ProjectTypeCode } from "@/lib/db/schema/project-types";

export async function GET(request: NextRequest) {
  await ensureCatalogSeeded();
  const table = request.nextUrl.searchParams.get("table");
  const projectType = request.nextUrl.searchParams.get("projectType") as ProjectTypeCode | null;

  if (table === "project_types") {
    return NextResponse.json({ projectTypes: listTypesSync() });
  }

  if (table === "cost_benchmarks") {
    return NextResponse.json({
      costBenchmarks: listCostsSync(
        projectType ? { projectTypeCode: projectType } : undefined,
      ),
    });
  }

  if (table === "permit_rules") {
    if (!projectType) {
      return NextResponse.json({ error: "projectType query required" }, { status: 400 });
    }
    return NextResponse.json({ permitRules: listRulesSync(projectType) });
  }

  const catalog = await loadCatalog();
  return NextResponse.json({
    schemaVersion: catalog.schemaVersion,
    projectTypes: catalog.projectTypes,
    costBenchmarks: catalog.costBenchmarks,
    permitRules: catalog.permitRules,
  });
}
