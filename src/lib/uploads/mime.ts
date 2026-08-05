/** Resolve a safe content-type for uploads when browsers omit or mislabel MIME. */

const IMAGE_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function extOf(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function looksLikePdf(file: {
  name: string;
  type?: string;
}): boolean {
  const type = (file.type || "").toLowerCase().trim();
  if (type === "application/pdf" || type === "application/x-pdf") return true;
  return extOf(file.name) === "pdf";
}

export function resolveImageContentType(file: {
  name: string;
  type?: string;
}): string | null {
  const raw = (file.type || "").toLowerCase().trim();
  if (
    raw === "image/jpeg" ||
    raw === "image/jpg" ||
    raw === "image/pjpeg" ||
    raw === "image/png" ||
    raw === "image/webp" ||
    raw === "image/gif"
  ) {
    return raw === "image/jpg" || raw === "image/pjpeg" ? "image/jpeg" : raw;
  }
  return IMAGE_EXT[extOf(file.name)] ?? null;
}

/** AutoCAD DWG only (.dxf is rejected for vendor CAD uploads). */
export function looksLikeDwg(file: { name: string; type?: string }): boolean {
  if (extOf(file.name) !== "dwg") return false;
  const type = (file.type || "").toLowerCase().trim();
  if (!type) return true;
  return (
    type === "application/acad" ||
    type === "application/x-acad" ||
    type === "application/autocad_dwg" ||
    type === "application/dwg" ||
    type === "application/x-dwg" ||
    type === "image/vnd.dwg" ||
    type === "application/octet-stream"
  );
}

/** Structural calc sheets — PDF only (same rule as blueprint / BOQ). */
export function looksLikeCalcDoc(file: { name: string; type?: string }): boolean {
  return looksLikePdf(file);
}

/** ZIP plan packages (optional document delivery). */
export function looksLikeZip(file: { name: string; type?: string }): boolean {
  const ext = extOf(file.name);
  if (ext !== "zip") return false;
  const type = (file.type || "").toLowerCase().trim();
  if (!type) return true;
  return (
    type === "application/zip" ||
    type === "application/x-zip-compressed" ||
    type === "multipart/x-zip" ||
    type === "application/octet-stream"
  );
}

export function resolveDocumentContentType(file: {
  name: string;
  type?: string;
}): string | null {
  if (looksLikePdf(file)) return "application/pdf";
  if (looksLikeZip(file)) return "application/zip";
  if (looksLikeDwg(file)) {
    const type = (file.type || "").toLowerCase().trim();
    if (
      type &&
      type !== "application/octet-stream"
    ) {
      return type;
    }
    return "application/acad";
  }
  return null;
}

/** True when buffer starts with %PDF. */
export function bufferLooksLikePdf(buf: Buffer | Uint8Array): boolean {
  if (buf.length < 4) return false;
  return (
    buf[0] === 0x25 && // %
    buf[1] === 0x50 && // P
    buf[2] === 0x44 && // D
    buf[3] === 0x46 // F
  );
}

/** True when buffer looks like a ZIP archive (local file header / empty archive). */
export function bufferLooksLikeZip(buf: Buffer | Uint8Array): boolean {
  if (buf.length < 4) return false;
  // PK\x03\x04 (file) · PK\x05\x06 (empty) · PK\x07\x08 (spanned)
  return (
    buf[0] === 0x50 &&
    buf[1] === 0x4b &&
    (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07) &&
    (buf[3] === 0x04 || buf[3] === 0x06 || buf[3] === 0x08)
  );
}
