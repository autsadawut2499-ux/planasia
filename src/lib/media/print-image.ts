/**
 * Open a print-friendly window for a remote image (optional horizontal flip).
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function printRemoteImage(opts: {
  url: string;
  title: string;
  flipX?: boolean;
}): boolean {
  const url = opts.url.trim();
  if (!url) return false;

  const w = window.open("", "_blank");
  if (!w) return false;

  const title = escapeHtml(opts.title || "Print");
  const src = escapeHtml(url);
  const transform = opts.flipX ? "transform:scaleX(-1)" : "";

  w.document.write(
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title></head>` +
      `<body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff">` +
      `<img src="${src}" alt="" style="max-width:100%;${transform}" onload="window.print()" />` +
      `</body></html>`,
  );
  w.document.close();
  return true;
}
