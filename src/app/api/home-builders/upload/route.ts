import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import { getSiteAssetPublicUrl, siteAssetPath, SITE_ASSETS_BUCKET } from "@/lib/supabase/site-assets";

export const dynamic = "force-dynamic";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const DOC_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const IMAGE_MAX = 10 * 1024 * 1024;
const DOC_MAX = 20 * 1024 * 1024;

const ALLOWED_KINDS = new Set([
  "portfolio",
  "logo",
  "company_certificate",
  "verification_document",
]);

/**
 * Public upload for home-builder registration assets.
 * Files land in site-assets under home-builders/ — docs stay as private URLs
 * only when stored as public paths; access is via admin review of pending rows.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const kind = ((formData.get("kind") as string) || "portfolio").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }
    if (!ALLOWED_KINDS.has(kind)) {
      return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
    }

    const isDoc = kind === "company_certificate" || kind === "verification_document";
    const allowed = isDoc ? DOC_TYPES : IMAGE_TYPES;
    const maxBytes = isDoc ? DOC_MAX : IMAGE_MAX;

    if (!allowed.has(file.type)) {
      return NextResponse.json(
        {
          error: isDoc
            ? "อนุญาตเฉพาะ PDF หรือรูปภาพ (JPG/PNG/WebP)"
            : "อนุญาตเฉพาะไฟล์รูปภาพ (JPG/PNG/WebP/GIF)",
        },
        { status: 400 },
      );
    }
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `ไฟล์ใหญ่เกินไป (สูงสุด ${Math.round(maxBytes / 1024 / 1024)}MB)` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = siteAssetPath(`home-builders/${kind}`, file.name);

    const { error } = await getSupabaseAdmin()
      .storage.from(SITE_ASSETS_BUCKET)
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });
    if (error) throw error;

    return NextResponse.json({
      storagePath,
      publicUrl: getSiteAssetPublicUrl(storagePath),
      mimeType: file.type,
      sizeBytes: file.size,
      kind,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
