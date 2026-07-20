"use client";

import { useCallback, useEffect, useState } from "react";
import type { CostBenchmark } from "@/lib/db/schema/cost-benchmarks";
import type { PermitRule } from "@/lib/db/schema/permit-rules";
import type { ProjectType, ProjectTypeCode } from "@/lib/db/schema/project-types";

interface CatalogState {
  projectTypes: ProjectType[];
  loading: boolean;
  error: string | null;
}

let cachedTypes: ProjectType[] | null = null;

export function useCatalog() {
  const [state, setState] = useState<CatalogState>({
    projectTypes: cachedTypes ?? [],
    loading: !cachedTypes,
    error: null,
  });

  useEffect(() => {
    if (cachedTypes) return;

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/catalog?table=project_types");
        if (!res.ok) throw new Error("catalog fetch failed");
        const data = (await res.json()) as { projectTypes: ProjectType[] };
        cachedTypes = data.projectTypes ?? [];
        if (!cancelled) {
          setState({ projectTypes: cachedTypes, loading: false, error: null });
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, loading: false, error: "catalog fetch failed" }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const getProjectType = useCallback(
    (code: ProjectTypeCode) => state.projectTypes.find((t) => t.code === code),
    [state.projectTypes],
  );

  const fetchCostBenchmarks = useCallback(async (projectTypeCode: ProjectTypeCode) => {
    const res = await fetch(`/api/catalog?table=cost_benchmarks&projectType=${projectTypeCode}`);
    if (!res.ok) return [] as CostBenchmark[];
    const data = (await res.json()) as { costBenchmarks: CostBenchmark[] };
    return data.costBenchmarks ?? [];
  }, []);

  const fetchPermitRules = useCallback(async (projectTypeCode: ProjectTypeCode) => {
    const res = await fetch(`/api/catalog?table=permit_rules&projectType=${projectTypeCode}`);
    if (!res.ok) return [] as PermitRule[];
    const data = (await res.json()) as { permitRules: PermitRule[] };
    return data.permitRules ?? [];
  }, []);

  return {
    ...state,
    getProjectType,
    fetchCostBenchmarks,
    fetchPermitRules,
  };
}
