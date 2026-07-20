"use client";

import { useCallback, useState } from "react";
import type { ProjectInput } from "@/lib/ai/types";
import type { DesignEditorState } from "@/lib/design/editor-types";
import { applyEditorToProject } from "@/lib/design/editor-state";
import type { DesignExportBundle } from "@/lib/design/export-documentation";
import { downloadJsonBundle } from "@/lib/pdf/documentation-summary";

export type { DesignExportBundle };

export function useDesignExport() {
  const [loading, setLoading] = useState(false);

  const fetchExport = useCallback(async (project: ProjectInput, editorState: DesignEditorState) => {
    const res = await fetch("/api/design/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: applyEditorToProject(project, editorState),
        editorState,
      }),
    });
    if (res.status === 429) {
      throw new Error("rate_limited");
    }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error((data as { error?: string }).error ?? "export failed");
    }
    const data = (await res.json()) as { export: DesignExportBundle };
    return data.export;
  }, []);

  const downloadJson = useCallback(
    async (project: ProjectInput, editorState: DesignEditorState) => {
      setLoading(true);
      try {
        const payload = await fetchExport(project, editorState);
        downloadJsonBundle(payload, project.projectName || "planasia-design");
        return payload;
      } finally {
        setLoading(false);
      }
    },
    [fetchExport],
  );

  return { loading, fetchExport, downloadJson };
}
