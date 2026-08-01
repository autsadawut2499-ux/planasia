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

export function resolveDocumentContentType(file: {
  name: string;
  type?: string;
}): string | null {
  return looksLikePdf(file) ? "application/pdf" : null;
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
