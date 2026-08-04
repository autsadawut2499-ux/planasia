/** Matches listing attachment kinds used by download grants. */
export type DeliveryFileKind = "blueprint" | "cad" | "boq" | "calc";

const KIND_ORDER: DeliveryFileKind[] = ["blueprint", "cad", "calc", "boq"];

/**
 * International delivery filenames (project code + document type).
 * Index suffix avoids collisions when a kind has more than one file.
 */
export function standardizedDeliveryFilename(
  planCode: string,
  kind: DeliveryFileKind,
  fileIndex = 0,
): string {
  const code = (planCode || "PLAN").trim().replace(/[^\w.-]+/g, "-") || "PLAN";
  const suffix = fileIndex > 0 ? `-${fileIndex + 1}` : "";

  switch (kind) {
    case "blueprint":
      return `${code}-Architectural-Plans${suffix}.pdf`;
    case "cad":
      return `${code}-CAD-Files${suffix}.dwg`;
    case "calc":
      return `${code}-Structural-Calculations${suffix}.pdf`;
    case "boq":
      return `${code}-BOQ-Bill-of-Quantities${suffix}.pdf`;
    default:
      return `${code}-Document${suffix}.pdf`;
  }
}

/** Button / link label — English for Thai and international buyers. */
export function standardizedDownloadButtonLabel(
  planCode: string,
  kind: DeliveryFileKind,
  fileIndex = 0,
): string {
  return `Download ${standardizedDeliveryFilename(planCode, kind, fileIndex)}`;
}

export function resolveDeliveryFileKind(opts: {
  fileKind?: string | null;
  format?: string | null;
}): DeliveryFileKind {
  const kind = (opts.fileKind || "").trim().toLowerCase();
  if (kind === "blueprint" || kind === "cad" || kind === "boq" || kind === "calc") {
    return kind;
  }
  return opts.format === "cad" ? "cad" : "blueprint";
}

export function deliveryKindSortKey(kind: DeliveryFileKind): number {
  const i = KIND_ORDER.indexOf(kind);
  return i >= 0 ? i : 99;
}
