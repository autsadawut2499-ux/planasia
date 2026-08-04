/**
 * Force a file download to disk (attachment), instead of navigating / opening
 * the URL in a new tab. Cross-origin URLs fall back to a same-origin proxy
 * because the HTML `download` attribute is ignored off-origin.
 */

export function guessDownloadFilename(url: string, fallbackBase: string): string {
  try {
    const path = new URL(url).pathname;
    const leaf = path.split("/").pop() || "";
    const extMatch = leaf.match(/\.(jpe?g|png|webp|gif|avif|svg|pdf)$/i);
    if (extMatch) {
      const ext = extMatch[1].toLowerCase().replace("jpeg", "jpg");
      return `${fallbackBase}.${ext}`;
    }
  } catch {
    /* ignore */
  }
  return `${fallbackBase}.jpg`;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_500);
}

async function flipImageBlobHorizontal(blob: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return blob;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(bitmap, 0, 0);
    const type = blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg";
    const flipped = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), type, 0.92),
    );
    return flipped ?? blob;
  } finally {
    bitmap.close();
  }
}

async function fetchMediaBlob(url: string, filename: string): Promise<Blob> {
  try {
    const res = await fetch(url, {
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Direct fetch failed (${res.status})`);
    return await res.blob();
  } catch {
    const proxy = `/api/media/force-download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const res = await fetch(proxy, { cache: "no-store" });
    if (!res.ok) throw new Error(`Proxy fetch failed (${res.status})`);
    return await res.blob();
  }
}

/**
 * Download a media URL as an attachment. Optionally mirror horizontally first
 * (e.g. floor-plan “Reverse” view).
 */
export async function forceDownloadMedia(
  url: string,
  filename: string,
  opts?: { flipX?: boolean },
): Promise<void> {
  const source = url.trim();
  if (!source) throw new Error("Missing download URL");

  let blob = await fetchMediaBlob(source, filename);
  if (opts?.flipX) {
    try {
      blob = await flipImageBlobHorizontal(blob);
    } catch {
      /* keep original if canvas flip fails */
    }
  }
  triggerBlobDownload(blob, filename);
}
