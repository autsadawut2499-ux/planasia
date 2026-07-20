import type { UploadedFileRef } from "@/lib/ai/types";

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

export function resizeUploadsForFloors(
  floorPlans: (UploadedFileRef | null)[],
  floors: 1 | 2,
): (UploadedFileRef | null)[] {
  if (floors === 1) return [floorPlans[0] ?? null];
  return [floorPlans[0] ?? null, floorPlans[1] ?? null];
}
