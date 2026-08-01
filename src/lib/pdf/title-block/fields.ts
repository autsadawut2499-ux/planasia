import type { DrawingIndexEntry, HousePlanDocument } from "@/lib/plans/schema";
import type { TitleBlockFieldKey, TitleBlockFieldValues, TitleBlockMetadata } from "@/lib/pdf/title-block/schema";

function formatIssueDate(iso?: string, createdAt?: string): string {
  const src = iso ?? createdAt;
  if (!src) return new Date().toISOString().slice(0, 10);
  try {
    return new Date(src).toISOString().slice(0, 10);
  } catch {
    return src.slice(0, 10);
  }
}

function truncate(value: string, max?: number): string {
  if (!max || value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

/** Build default title block metadata from project data (used before / without AI). */
export function buildDefaultTitleBlockMetadata(doc: HousePlanDocument): TitleBlockMetadata {
  return {
    architectEngineer: "Titan Box AI Design Studio",
    architectEngineerTh: "Titan Box AI — สตูดิโอออกแบบ",
    drawnBy: "AI / User",
    checkedBy: "—",
    approvedBy: "—",
    revision: "A",
    issueDate: formatIssueDate(undefined, doc.createdAt),
    firmName: "Titan Box",
  };
}

/** Merge AI-provided title block fields onto document defaults. */
export function mergeTitleBlockMetadata(
  doc: HousePlanDocument,
  incoming?: TitleBlockMetadata | null,
): TitleBlockMetadata {
  const base = doc.titleBlock ?? buildDefaultTitleBlockMetadata(doc);
  return { ...base, ...incoming };
}

/** Resolve all title block field values for a specific sheet. */
export function resolveTitleBlockFields(
  doc: HousePlanDocument,
  entry: DrawingIndexEntry,
  maxLengths?: Partial<Record<TitleBlockFieldKey, number>>,
): TitleBlockFieldValues {
  const meta = mergeTitleBlockMetadata(doc, doc.titleBlock);
  const project = doc.project;

  const values: TitleBlockFieldValues = {
    projectName: project.projectName || "Residential House",
    ownerName: project.ownerName || "—",
    location: project.location || "—",
    architectEngineer: meta.architectEngineer || "Titan Box AI Design Studio",
    architectEngineerTh: meta.architectEngineerTh || meta.architectEngineer || "",
    sheetNo: entry.sheetNo,
    sheetTitle: entry.title,
    sheetTitleTh: entry.titleTh,
    scale: entry.scale,
    issueDate: formatIssueDate(meta.issueDate, doc.createdAt),
    drawnBy: meta.drawnBy || "AI / User",
    checkedBy: meta.checkedBy || "—",
    approvedBy: meta.approvedBy || "—",
    revision: meta.revision || "A",
    buildingCode: doc.buildingCode,
    firmName: meta.firmName || "Titan Box",
  };

  if (maxLengths) {
    for (const [key, max] of Object.entries(maxLengths) as [TitleBlockFieldKey, number][]) {
      values[key] = truncate(values[key], max);
    }
  }

  return values;
}

/** Context block for AI plan generation — lists fields the model should populate. */
export function buildTitleBlockAiContext(): string {
  return `TITLE BLOCK (fill "titleBlock" object on every permit sheet export):
- architectEngineer: licensed architect or engineer of record name (EN)
- architectEngineerTh: Thai name if applicable
- drawnBy: drafter initials or name
- checkedBy: checker initials (use "—" if unknown)
- approvedBy: approver (use "—" if unknown)
- revision: drawing revision letter (default "A")
- issueDate: ISO date YYYY-MM-DD (use project date)
- firmName: "Titan Box" (platform attribution)

Project name, owner name, location, sheet number, sheet title, and scale are filled automatically per sheet from project + index.
STRICT: Use only the Titan Box standard title block references:
- CAD: templates/title-block/STANDARD-TITLE-BLOCK.dwg
- PDF plot: templates/title-block/STANDARD-TITLE-BLOCK.plt
Field layout follows titan-box-standard.json (OWNER, NO., DESIGNED BY, CHECKED, APPROVED BY, SCALE, DATE, REV).`;
}
