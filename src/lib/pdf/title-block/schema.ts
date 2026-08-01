/** Title block template schema — pure vector field layout (JSON). */

export type TitleBlockFieldKey =
  | "projectName"
  | "ownerName"
  | "location"
  | "architectEngineer"
  | "architectEngineerTh"
  | "sheetNo"
  | "sheetTitle"
  | "sheetTitleTh"
  | "scale"
  | "issueDate"
  | "drawnBy"
  | "checkedBy"
  | "approvedBy"
  | "revision"
  | "buildingCode"
  | "firmName";

export interface TitleBlockGeometryRect {
  type: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  strokeWidth?: number;
}

export interface TitleBlockGeometryLine {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth?: number;
}

export type TitleBlockGeometry = TitleBlockGeometryRect | TitleBlockGeometryLine;

export interface TitleBlockLabel {
  text: string;
  x: number;
  y: number;
  fontSize: number;
  bold?: boolean;
}

export interface TitleBlockFieldSlot {
  key: TitleBlockFieldKey;
  x: number;
  y: number;
  w: number;
  fontSize: number;
  bold?: boolean;
  maxLength?: number;
  color?: string;
}

export interface TitleBlockTemplate {
  id: string;
  name: string;
  nameTh?: string;
  version: string;
  sheetSize: "A3";
  orientation: "landscape" | "portrait";
  sourceFile?: string;
  sourcePath?: string;
  plotReferenceFile?: string;
  plotReferencePath?: string;
  plotReferenceFormat?: "pdf";
  cadLayout?: string;
  heightPt: number;
  geometry: TitleBlockGeometry[];
  labels?: TitleBlockLabel[];
  fields: TitleBlockFieldSlot[];
}

/** AI/user-provided metadata stored on the plan document (sheet-specific fields resolved at render). */
export interface TitleBlockMetadata {
  architectEngineer?: string;
  architectEngineerTh?: string;
  drawnBy?: string;
  checkedBy?: string;
  approvedBy?: string;
  revision?: string;
  /** ISO date string YYYY-MM-DD */
  issueDate?: string;
  firmName?: string;
}

export type TitleBlockFieldValues = Record<TitleBlockFieldKey, string>;

export interface TitleBlockRenderContext {
  doc: import("@/lib/plans/schema").HousePlanDocument;
  entry: import("@/lib/plans/schema").DrawingIndexEntry;
}
