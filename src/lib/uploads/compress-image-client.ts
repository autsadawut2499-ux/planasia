/**
 * Browser-side image compression before upload.
 * Resizes to a max edge and re-encodes as WebP (JPEG fallback) to cut payload size.
 */

export const IMAGE_COMPRESS_MAX_EDGE = 1920;
export const IMAGE_COMPRESS_QUALITY = 0.82;
/** Skip compression when already small enough (bytes). */
export const IMAGE_COMPRESS_SKIP_BELOW_BYTES = 350 * 1024;

function replaceExt(name: string, ext: string): string {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${ext}`;
}

/**
 * Compress an image File in the browser. Returns the original file when
 * compression is unnecessary, unsupported, or would not shrink the payload.
 */
export async function compressImageFile(
  file: File,
  opts?: { maxEdge?: number; quality?: number },
): Promise<File> {
  if (typeof window === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;
  // Animated GIF / SVG — leave untouched.
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  if (file.size > 0 && file.size < IMAGE_COMPRESS_SKIP_BELOW_BYTES) return file;

  const maxEdge = opts?.maxEdge ?? IMAGE_COMPRESS_MAX_EDGE;
  const quality = opts?.quality ?? IMAGE_COMPRESS_QUALITY;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const preferWebp = typeof canvas.toBlob === "function";
    const blob = await new Promise<Blob | null>((resolve) => {
      if (!preferWebp) {
        resolve(null);
        return;
      }
      canvas.toBlob((b) => resolve(b), "image/webp", quality);
    });

    let outBlob = blob;
    let mime = "image/webp";
    let ext = "webp";
    if (!outBlob || outBlob.size === 0) {
      outBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
      });
      mime = "image/jpeg";
      ext = "jpg";
    }

    if (!outBlob || outBlob.size === 0 || outBlob.size >= file.size) {
      return file;
    }

    return new File([outBlob], replaceExt(file.name, ext), {
      type: mime,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

export function isImageUploadKind(kind: string): boolean {
  return (
    kind === "avatar" ||
    kind === "cover" ||
    kind === "render" ||
    kind === "floorplan" ||
    kind === "kyc"
  );
}
