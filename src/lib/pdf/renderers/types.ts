import type { DrawingIndexEntry } from "@/lib/plans/schema";
import type { SheetRenderInput, SheetRenderResult, VectorImplementationStatus } from "@/lib/pdf/types";
import { registryEntryForIndex } from "@/lib/pdf/sheet-registry";

export interface SheetRenderer {
  id: string;
  label: string;
  status: VectorImplementationStatus;
  /** Return true when this renderer handles the sheet */
  matches: (entry: DrawingIndexEntry) => boolean;
  render: (input: SheetRenderInput) => Promise<boolean>;
}

export function createRenderer(def: SheetRenderer): SheetRenderer {
  return def;
}

export function renderResult(
  entry: DrawingIndexEntry,
  rendered: boolean,
  renderer: SheetRenderer,
  skippedReason?: string,
): SheetRenderResult {
  const reg = registryEntryForIndex(entry);
  return {
    sheetNo: entry.sheetNo,
    rendered,
    rendererId: renderer.id,
    status: reg.vectorStatus,
    skippedReason,
  };
}
