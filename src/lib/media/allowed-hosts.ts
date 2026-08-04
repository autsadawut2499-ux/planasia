/** Hosts allowed for same-origin media proxy / force-download. */
export const FORCE_DOWNLOAD_HOST_SUFFIXES = [".supabase.co"] as const;

export function isAllowedForceDownloadHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return FORCE_DOWNLOAD_HOST_SUFFIXES.some(
    (suffix) => host === suffix.slice(1) || host.endsWith(suffix),
  );
}

export function isAllowedForceDownloadUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return isAllowedForceDownloadHost(u.hostname);
  } catch {
    return false;
  }
}

export function safeDownloadFilename(raw: string | null | undefined): string {
  const cleaned = (raw || "download.jpg")
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "-")
    .slice(0, 120);
  return cleaned || "download.jpg";
}
