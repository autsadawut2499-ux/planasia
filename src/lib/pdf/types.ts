import type { PDFDocument, PDFFont } from "pdf-lib";
import type { DrawingIndexEntry, HousePlanDocument } from "@/lib/plans/schema";
import type { UnitFormatOptions } from "@/lib/units/format";

/** How complete the pure-vector renderer is for a sheet type. */
export type VectorImplementationStatus =
  | "vector-complete"
  | "vector-partial"
  | "data-placeholder"
  | "pending";

export type DrawingDiscipline = DrawingIndexEntry["category"];

/** Shared input passed to every sheet renderer (100% pdf-lib vector — no raster). */
export interface SheetRenderInput {
  pdf: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  doc: HousePlanDocument;
  entry: DrawingIndexEntry;
  unitOpts: UnitFormatOptions;
}

export interface SheetRenderResult {
  sheetNo: string;
  rendered: boolean;
  rendererId: string;
  status: VectorImplementationStatus;
  skippedReason?: string;
}

export interface RenderSetProgress {
  sheetNo: string;
  index: number;
  total: number;
  progress: number;
  rendererId: string;
}

export interface RenderSetOptions {
  unitSystem?: import("@/lib/geo/countries").UnitSystem;
  /** 0–100 progress callback for export jobs */
  onProgress?: (event: RenderSetProgress) => void | Promise<void>;
  /** When true, sheets without a renderer are omitted instead of failing */
  skipUnmatched?: boolean;
}

export interface RenderSetResult {
  bytes: Uint8Array;
  sheetCount: number;
  sheets: SheetRenderResult[];
  validation: DrawingSetValidation;
}

export interface DrawingSetValidation {
  valid: boolean;
  totalSheets: number;
  renderableSheets: number;
  pendingVectorSheets: string[];
  missingDataSheets: string[];
  skippedSheets: string[];
  byDiscipline: Record<DrawingDiscipline, { total: number; renderable: number }>;
  /** DPT layout + Titan Box title block reference files present on disk */
  standardsCompliant: boolean;
  standardsIssues: string[];
}
