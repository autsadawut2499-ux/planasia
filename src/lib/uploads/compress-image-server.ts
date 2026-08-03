import "server-only";

import sharp from "sharp";

export const SERVER_IMAGE_MAX_EDGE = 1920;
export const SERVER_IMAGE_WEBP_QUALITY = 82;

export interface CompressedImage {
  buffer: Buffer;
  contentType: "image/webp";
  fileName: string;
  width: number;
  height: number;
}

function toWebpFileName(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.webp`;
}

/**
 * Server-side image compression with sharp (rotate via EXIF, resize, WebP).
 * Used on the vendor/admin proxy upload path before writing to storage.
 */
export async function compressImageBuffer(
  input: Buffer,
  originalName: string,
  opts?: { maxEdge?: number; quality?: number },
): Promise<CompressedImage> {
  const maxEdge = opts?.maxEdge ?? SERVER_IMAGE_MAX_EDGE;
  const quality = opts?.quality ?? SERVER_IMAGE_WEBP_QUALITY;

  const pipeline = sharp(input, { failOn: "none" }).rotate();
  const meta = await pipeline.metadata();
  const width = meta.width ?? maxEdge;
  const height = meta.height ?? maxEdge;
  const longest = Math.max(width, height);

  let out = pipeline;
  if (longest > maxEdge) {
    out = out.resize({
      width: width >= height ? maxEdge : undefined,
      height: height > width ? maxEdge : undefined,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const buffer = await out.webp({ quality, effort: 4 }).toBuffer();
  const outMeta = await sharp(buffer).metadata();

  return {
    buffer,
    contentType: "image/webp",
    fileName: toWebpFileName(originalName),
    width: outMeta.width ?? width,
    height: outMeta.height ?? height,
  };
}
