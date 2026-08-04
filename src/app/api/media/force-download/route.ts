import { NextResponse } from "next/server";
import {
  isAllowedForceDownloadUrl,
  safeDownloadFilename,
} from "@/lib/media/allowed-hosts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 25 * 1024 * 1024;

/**
 * Same-origin proxy that streams remote media with Content-Disposition: attachment
 * so browsers save the file instead of opening it in a new tab.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = (searchParams.get("url") || "").trim();
  const filename = safeDownloadFilename(searchParams.get("filename"));

  if (!url || !isAllowedForceDownloadUrl(url)) {
    return NextResponse.json({ error: "Invalid or disallowed URL" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "image/*,application/octet-stream,*/*" },
    });
  } catch {
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: `Upstream responded ${upstream.status}` },
      { status: 502 },
    );
  }

  const contentLength = Number(upstream.headers.get("content-length") || "0");
  if (contentLength > MAX_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream";

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
