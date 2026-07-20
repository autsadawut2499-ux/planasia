"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectInput } from "@/lib/ai/types";
import type { BuildingSpecifications } from "@/lib/db/schema/building-specifications";
import type { PermitComplianceReport } from "@/lib/db/schema/permit-rules";

export interface ProjectValidationResult {
  buildingSpec: BuildingSpecifications;
  permitCompliance: PermitComplianceReport;
}

interface UseProjectValidationOptions {
  debounceMs?: number;
  enabled?: boolean;
}

export function useProjectValidation(
  project: ProjectInput,
  options: UseProjectValidationOptions = {},
) {
  const { debounceMs = 700, enabled = true } = options;
  const [result, setResult] = useState<ProjectValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const validateNow = useCallback(async (input: ProjectInput) => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/projects/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: input }),
      });
      if (res.status === 429) {
        throw new Error("rate_limited");
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "validation failed");
      }
      const data = (await res.json()) as ProjectValidationResult;
      if (id === requestId.current) {
        setResult(data);
      }
      return data;
    } catch (err) {
      if (id === requestId.current) {
        setError(err instanceof Error ? err.message : "validation failed");
        setResult(null);
      }
      return null;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => {
      void validateNow(project);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [project, debounceMs, enabled, validateNow]);

  return { result, loading, error, validateNow };
}
