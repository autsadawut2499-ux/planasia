import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  extractSiteAssetPath,
  getSiteAssetPublicUrl,
  siteAssetPath,
  SITE_ASSETS_BUCKET,
} from "@/lib/supabase/site-assets";

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

function resolveContentType(file: File): string | null {
  const raw = (file.type || "").toLowerCase().trim();
  if (raw && ALLOWED_TYPES.has(raw)) {
    return raw === "image/jpg" || raw === "image/pjpeg" ? "image/jpeg" : raw;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_MIME[ext] ?? null;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    if (!isSupabaseConfigured()) {
      console.error("[admin/upload] Supabase is not configured");
      return NextResponse.json(
        { error: "Supabase not configured — ตรวจ NEXT_PUBLIC_SUPABASE_URL และ SERVICE_ROLE_KEY" },
        { status: 503 },
      );
    }

    // multipart/form-data — browser sets boundary automatically via FormData
    const formData = await request.formData();
    const file = formData.get("file");
    const category = (formData.get("category") as string)?.trim() || "general";

    if (!(file instanceof File)) {
      console.error("[admin/upload] Missing file field in FormData");
      return NextResponse.json({ error: "file is required (multipart field name: file)" }, { status: 400 });
    }

    const contentType = resolveContentType(file);
    if (!contentType) {
      console.error("[admin/upload] Unsupported type", {
        name: file.name,
        type: file.type,
        size: file.size,
      });
      return NextResponse.json(
        {
          error: `รูปแบบไฟล์ไม่รองรับ (${file.type || "unknown"}). ใช้ JPG, PNG, WEBP หรือ GIF`,
        },
        { status: 400 },
      );
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "ไฟล์ว่างเปล่า" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      console.error("[admin/upload] File too large", { name: file.name, size: file.size });
      return NextResponse.json(
        { error: `ไฟล์ใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)}MB) — สูงสุด 10MB` },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = siteAssetPath(category, file.name);

    const { error } = await getSupabaseAdmin()
      .storage.from(SITE_ASSETS_BUCKET)
      .upload(storagePath, buffer, {
        contentType,
        upsert: true,
        // Short CDN/browser TTL — admin often replaces covers; paths are unique but keep TTL low.
        cacheControl: "60",
      });

    if (error) {
      console.error("[admin/upload] Storage upload failed", {
        storagePath,
        bucket: SITE_ASSETS_BUCKET,
        message: error.message,
      });
      throw new Error(`อัปโหลด Storage ไม่สำเร็จ: ${error.message}`);
    }

    const publicUrl = getSiteAssetPublicUrl(storagePath);
    console.info("[admin/upload] OK", {
      storagePath,
      publicUrl,
      mimeType: contentType,
      sizeBytes: file.size,
      category,
    });

    return NextResponse.json({
      ok: true,
      storagePath,
      publicUrl,
      mimeType: contentType,
      sizeBytes: file.size,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[admin/upload] Error", message);
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Remove a previously uploaded site-assets file (by public URL or storage path). */
export async function DELETE(request: NextRequest) {
  try {
    await requireAdminSession();
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      publicUrl?: string;
      storagePath?: string;
    };

    const storagePath =
      body.storagePath?.trim() ||
      (body.publicUrl ? extractSiteAssetPath(body.publicUrl) : null);

    if (!storagePath) {
      return NextResponse.json(
        { error: "publicUrl or storagePath is required (site-assets only)" },
        { status: 400 },
      );
    }

    const { error } = await getSupabaseAdmin()
      .storage.from(SITE_ASSETS_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.error("[admin/upload] Delete failed", { storagePath, message: error.message });
      throw error;
    }

    return NextResponse.json({ ok: true, storagePath });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    console.error("[admin/upload] DELETE error", message);
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
