/**
 * Gemini Files API helpers — upload construction PDFs for multimodal translation.
 */

import "server-only";

import {
  FileState,
  GoogleAIFileManager,
  type FileMetadataResponse,
} from "@google/generative-ai/server";

const INLINE_MAX_BYTES = 15 * 1024 * 1024; // prefer File API above this
const UPLOAD_MAX_BYTES = 80 * 1024 * 1024; // hard cap per blueprint PDF
const POLL_MS = 2_000;
const POLL_MAX_ATTEMPTS = 45; // ~90s

export function getGeminiFileManager(): GoogleAIFileManager | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  return new GoogleAIFileManager(key);
}

export function shouldUseInlinePdf(byteLength: number): boolean {
  return byteLength > 0 && byteLength <= INLINE_MAX_BYTES;
}

export function assertPdfSizeOk(byteLength: number): void {
  if (byteLength <= 0) throw new Error("PDF is empty");
  if (byteLength > UPLOAD_MAX_BYTES) {
    throw new Error(
      `PDF exceeds max size for translation (${Math.round(byteLength / (1024 * 1024))} MB > ${UPLOAD_MAX_BYTES / (1024 * 1024)} MB)`,
    );
  }
}

/**
 * Upload a PDF buffer to Gemini Files API and wait until ACTIVE.
 */
export async function uploadPdfToGeminiFiles(opts: {
  bytes: Buffer;
  displayName: string;
}): Promise<FileMetadataResponse> {
  const manager = getGeminiFileManager();
  if (!manager) throw new Error("Gemini File Manager not configured");

  assertPdfSizeOk(opts.bytes.length);

  const uploaded = await manager.uploadFile(opts.bytes, {
    mimeType: "application/pdf",
    displayName: opts.displayName.slice(0, 120),
  });

  let file: FileMetadataResponse = uploaded.file;
  let attempts = 0;
  while (file.state === FileState.PROCESSING && attempts < POLL_MAX_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    file = await manager.getFile(file.name);
    attempts += 1;
  }

  if (file.state === FileState.FAILED) {
    throw new Error(`Gemini file processing failed for ${opts.displayName}`);
  }
  if (file.state !== FileState.ACTIVE) {
    throw new Error(
      `Gemini file not ready (${file.state}) for ${opts.displayName} after polling`,
    );
  }

  return file;
}

/** Best-effort cleanup — never throws. */
export async function deleteGeminiFile(fileName: string | undefined): Promise<void> {
  if (!fileName) return;
  try {
    const manager = getGeminiFileManager();
    if (!manager) return;
    await manager.deleteFile(fileName);
  } catch (err) {
    console.warn(
      "[gemini/files] delete failed",
      fileName,
      err instanceof Error ? err.message : err,
    );
  }
}
