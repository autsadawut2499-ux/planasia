import { MAX_UPLOAD_FILES_PER_SLOT, type UploadSlotFiles, type UploadedFileRef } from "@/lib/ai/types";

const MAX_BYTES = 8 * 1024 * 1024;

export async function fileToUploadRef(file: File): Promise<UploadedFileRef> {
  if (file.size > MAX_BYTES) {
    throw new Error("File too large (max 8MB)");
  }
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return {
    name: file.name,
    mimeType: file.type || "application/octet-stream",
    dataUrl,
    sizeBytes: file.size,
  };
}

export function hasUploadFiles(files: UploadSlotFiles): boolean {
  return files.length > 0;
}

export function uploadSlotSummary(files: UploadSlotFiles, max = MAX_UPLOAD_FILES_PER_SLOT): string {
  if (files.length === 0) return "—";
  return `${files.length}/${max}`;
}

export async function appendFilesToSlot(
  current: UploadSlotFiles,
  incoming: File[],
  max = MAX_UPLOAD_FILES_PER_SLOT,
): Promise<UploadSlotFiles> {
  const room = max - current.length;
  if (room <= 0) return current;
  const refs = await Promise.all(incoming.slice(0, room).map(fileToUploadRef));
  return [...current, ...refs];
}

export function removeFileAtIndex(files: UploadSlotFiles, index: number): UploadSlotFiles {
  return files.filter((_, i) => i !== index);
}
