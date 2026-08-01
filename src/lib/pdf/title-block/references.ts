/**
 * Canonical Titan Box title block reference assets.
 * DWG = CAD master geometry | PLT = PDF plot reference (file is PDF despite .plt extension).
 */
import { existsSync } from "fs";
import { join } from "path";
import { readFileSync } from "fs";
import { PDFDocument } from "pdf-lib";

export const TITAN_BOX_DWG_FILENAME = "STANDARD-TITLE-BLOCK.dwg";
export const TITAN_BOX_PLT_FILENAME = "STANDARD-TITLE-BLOCK.plt";

export type TitleBlockReferenceRole = "cad-master" | "pdf-plot-reference";

export interface TitleBlockReferenceAsset {
  id: string;
  filename: string;
  role: TitleBlockReferenceRole;
  format: "dwg" | "pdf";
  description: string;
  /** Project-relative path under templates/title-block/ */
  relativePath: string;
}

export const TITLE_BLOCK_REFERENCES: TitleBlockReferenceAsset[] = [
  {
    id: "titan-box-dwg",
    filename: TITAN_BOX_DWG_FILENAME,
    role: "cad-master",
    format: "dwg",
    description: "Master CAD title block (GstarCAD) — field layout and geometry source.",
    relativePath: `templates/title-block/${TITAN_BOX_DWG_FILENAME}`,
  },
  {
    id: "titan-box-plt",
    filename: TITAN_BOX_PLT_FILENAME,
    role: "pdf-plot-reference",
    format: "pdf",
    description:
      "Standard PDF plot reference (saved as .plt) — A3 title box visual standard for PDF output alignment.",
    relativePath: `templates/title-block/${TITAN_BOX_PLT_FILENAME}`,
  },
];

const TEMPLATE_DIR = join(process.cwd(), "templates", "title-block");

export function getTitleBlockReferenceDir(): string {
  return TEMPLATE_DIR;
}

export function getTitleBlockReferencePath(filename: string): string | null {
  const path = join(TEMPLATE_DIR, filename);
  return existsSync(path) ? path : null;
}

export function getTitleBlockDwgPath(): string | null {
  return getTitleBlockReferencePath(TITAN_BOX_DWG_FILENAME);
}

export function getTitleBlockPltPath(): string | null {
  return getTitleBlockReferencePath(TITAN_BOX_PLT_FILENAME);
}

export interface TitleBlockPdfReferenceInfo {
  registered: boolean;
  path?: string;
  pageCount?: number;
  widthPt?: number;
  heightPt?: number;
  widthMm?: number;
  heightMm?: number;
  orientation?: "portrait" | "landscape";
  note?: string;
}

/** Inspect the .plt PDF plot reference (cached per process). */
let cachedPdfInfo: TitleBlockPdfReferenceInfo | null = null;

export async function getTitleBlockPdfReferenceInfo(): Promise<TitleBlockPdfReferenceInfo> {
  if (cachedPdfInfo) return cachedPdfInfo;

  const path = getTitleBlockPltPath();
  if (!path) {
    cachedPdfInfo = { registered: false, note: "STANDARD-TITLE-BLOCK.plt not found" };
    return cachedPdfInfo;
  }

  try {
    const buf = readFileSync(path);
    if (buf.subarray(0, 5).toString("ascii") !== "%PDF-") {
      cachedPdfInfo = {
        registered: true,
        path,
        note: "File present but not PDF format — expected PDF plot output",
      };
      return cachedPdfInfo;
    }

    const pdf = await PDFDocument.load(buf);
    const page = pdf.getPage(0);
    const { width, height } = page.getSize();
    const widthMm = (width / 72) * 25.4;
    const heightMm = (height / 72) * 25.4;

    cachedPdfInfo = {
      registered: true,
      path,
      pageCount: pdf.getPageCount(),
      widthPt: width,
      heightPt: height,
      widthMm: Math.round(widthMm * 10) / 10,
      heightMm: Math.round(heightMm * 10) / 10,
      orientation: width < height ? "portrait" : "landscape",
      note: "PDF plot reference (A3) — used to validate vector title block output",
    };
    return cachedPdfInfo;
  } catch (err) {
    cachedPdfInfo = {
      registered: true,
      path,
      note: err instanceof Error ? err.message : "Failed to read PDF reference",
    };
    return cachedPdfInfo;
  }
}

export function listRegisteredTitleBlockReferences(): Array<
  TitleBlockReferenceAsset & { registered: boolean; absolutePath: string | null }
> {
  return TITLE_BLOCK_REFERENCES.map((ref) => ({
    ...ref,
    registered: Boolean(getTitleBlockReferencePath(ref.filename)),
    absolutePath: getTitleBlockReferencePath(ref.filename),
  }));
}

export function reloadTitleBlockReferenceCache(): void {
  cachedPdfInfo = null;
}
