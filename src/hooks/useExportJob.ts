"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExportJobFormat } from "@/lib/jobs/types";
import type { UnitSystem } from "@/lib/geo/countries";

export interface ExportJobState {
  jobId: string | null;
  status: "idle" | "queued" | "processing" | "completed" | "failed";
  progress: number;
  queuePosition: number;
  error: string | null;
  downloadUrl: string | null;
  resultFilename: string | null;
}

const POLL_MS = 1500;

export function useExportJob() {
  const [state, setState] = useState<ExportJobState>({
    jobId: null,
    status: "idle",
    progress: 0,
    queuePosition: 0,
    error: null,
    downloadUrl: null,
    resultFilename: null,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollJob = useCallback(
    async (jobId: string) => {
      const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        status: ExportJobState["status"];
        progress: number;
        queue_position: number;
        error?: string;
        download_url?: string | null;
        result_filename?: string;
      };
      setState((s) => ({
        ...s,
        status: data.status === "idle" ? s.status : data.status,
        progress: data.progress,
        queuePosition: data.queue_position,
        error: data.error ?? null,
        downloadUrl: data.download_url ?? null,
        resultFilename: data.result_filename ?? null,
      }));
      if (data.status === "completed" || data.status === "failed") {
        stopPolling();
      }
    },
    [stopPolling],
  );

  const startExport = useCallback(
    async (params: {
      token: string;
      format: ExportJobFormat;
      unitSystem: UnitSystem;
      countryCode: string;
    }) => {
      stopPolling();
      setState({
        jobId: null,
        status: "queued",
        progress: 0,
        queuePosition: 0,
        error: null,
        downloadUrl: null,
        resultFilename: null,
      });

      const res = await fetch("/api/jobs/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (res.status === 429) {
        setState((s) => ({ ...s, status: "failed", error: "rate_limited" }));
        return null;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setState((s) => ({
          ...s,
          status: "failed",
          error: (data as { error?: string }).error ?? "Failed to queue export",
        }));
        return null;
      }

      const data = (await res.json()) as { job_id: string; queue_position: number; progress: number };
      setState({
        jobId: data.job_id,
        status: "queued",
        progress: data.progress,
        queuePosition: data.queue_position,
        error: null,
        downloadUrl: null,
        resultFilename: null,
      });

      pollRef.current = setInterval(() => void pollJob(data.job_id), POLL_MS);
      void pollJob(data.job_id);
      return data.job_id;
    },
    [pollJob, stopPolling],
  );

  const reset = useCallback(() => {
    stopPolling();
    setState({
      jobId: null,
      status: "idle",
      progress: 0,
      queuePosition: 0,
      error: null,
      downloadUrl: null,
      resultFilename: null,
    });
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  return { state, startExport, reset };
}
