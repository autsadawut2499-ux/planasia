import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  extractSiteAssetPath,
  formatMb,
  getSiteAssetPublicUrl,
  siteAssetPath,
  SITE_ASSETS_BUCKET,
  SITE_ASSETS_DOC_MAX_BYTES,
  SITE_ASSETS_IMAGE_MAX_BYTES,
} from "@/lib/supabase/site-assets";
import {
  isSensitiveUploadKind,
  toPrivateAssetRef,
  VENDOR_PRIVATE_BUCKET,
} from "@/lib/supabase/private-assets";
import {
  bufferLooksLikePdf,
  looksLikeCalcDoc,
  looksLikeDwg,
  resolveDocumentContentType,
  resolveImageContentType,
} from "@/lib/uploads/mime";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const IMAGE_MAX = SITE_ASSETS_IMAGE_MAX_BYTES;
const DOC_MAX = SITE_ASSETS_DOC_MAX_BYTES;

const DOC_KINDS = new Set(["pdf", "document", "boq", "cad", "calc"]);
const IMAGE_KINDS = new Set(["cover", "render", "floorplan", "general", "image"]);

function isDocKind(kind: string): boolean {
  return DOC_KINDS.has(kind);
}

function docKindError(kind: string): string {
  if (kind === "cad") return "อัปโหลดได้เฉพาะไฟล์ AutoCAD (.dwg)";
  if (kind === "calc" || kind === "pdf" || kind === "document" || kind === "boq") {
    return "อัปโหลดได้เฉพาะไฟล์ PDF (.pdf)";
  }
  return "รูปแบบรูปภาพไม่รองรับ (ใช้ JPG, PNG, WEBP หรือ GIF)";
}

function resolveContentType(
  kind: string,
  file: { name: string; type?: string },
): string | null {
  return isDocKind(kind)
    ? resolveDocumentContentType(file)
    : resolveImageContentType(file);
}

function bucketForKind(kind: string): string {
  return isSensitiveUploadKind(kind) ? VENDOR_PRIVATE_BUCKET : SITE_ASSETS_BUCKET;
}

function persistUrlFor(kind: string, storagePath: string): string {
  if (isSensitiveUploadKind(kind)) {
    return toPrivateAssetRef(VENDOR_PRIVATE_BUCKET, storagePath);
  }
  return getSiteAssetPublicUrl(storagePath);
}

function clientFacingUrl(kind: string, storagePath: string): string {
  const base = persistUrlFor(kind, storagePath);
  if (isSensitiveUploadKind(kind) || !base.startsWith("http")) return base;
  return `${base}${base.includes("?") ? "&" : "?"}v=${Date.now()}`;
}

/**
 * POST multipart → proxy upload (images / small files).
 * POST JSON `{ mode: "sign", kind, fileName, sizeBytes }` → signed upload URL for large docs.
 *
 * Docs (pdf/cad/boq/calc) → private `vendor-private` (≤100MB).
 * Images → public `site-assets` (≤10MB).
 */
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Supabase not configured — ตรวจ NEXT_PUBLIC_SUPABASE_URL และ SERVICE_ROLE_KEY" },
        { status: 503 },
      );
    }

    const contentTypeHeader = request.headers.get("content-type") || "";
    if (contentTypeHeader.includes("application/json")) {
      return signUpload(request, admin.email);
    }

    return proxyUpload(request, admin.email);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[admin/upload] Error", message);
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function signUpload(request: NextRequest, adminEmail: string) {
  const body = (await request.json()) as {
    mode?: string;
    kind?: string;
    fileName?: string;
    sizeBytes?: number;
    contentType?: string;
  };

  if (body.mode !== "sign") {
    return NextResponse.json({ error: "mode ต้องเป็น sign" }, { status: 400 });
  }

  const kind = (body.kind || "").trim().toLowerCase();
  const fileName = (body.fileName || "").trim();
  const sizeBytes = Number(body.sizeBytes ?? 0);

  if (!kind || (!DOC_KINDS.has(kind) && !IMAGE_KINDS.has(kind))) {
    return NextResponse.json({ error: "ชนิดไฟล์ไม่ถูกต้อง" }, { status: 400 });
  }
  if (!fileName) {
    return NextResponse.json({ error: "ต้องระบุชื่อไฟล์" }, { status: 400 });
  }

  const maxBytes = isDocKind(kind) ? DOC_MAX : IMAGE_MAX;
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return NextResponse.json({ error: "ขนาดไฟล์ไม่ถูกต้อง" }, { status: 400 });
  }
  if (sizeBytes > maxBytes) {
    return NextResponse.json(
      {
        error: `ไฟล์ใหญ่เกินไป (${(sizeBytes / 1024 / 1024).toFixed(1)}MB) — สูงสุด ${formatMb(maxBytes)}MB`,
      },
      { status: 400 },
    );
  }

  const resolved = resolveContentType(kind, {
    name: fileName,
    type: body.contentType,
  });
  if (!resolved) {
    return NextResponse.json({ error: docKindError(kind) }, { status: 400 });
  }

  const safeAdmin = adminEmail.replace(/[^a-zA-Z0-9_-]/g, "_") || "admin";
  const storagePath = isDocKind(kind)
    ? siteAssetPath(`admin/${safeAdmin}/${kind}`, fileName)
    : siteAssetPath(`listings/${kind === "image" ? "general" : kind}`, fileName);
  const bucket = bucketForKind(kind);

  const { data, error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .createSignedUploadUrl(storagePath, { upsert: true });

  if (error || !data) {
    console.error("[admin/upload] createSignedUploadUrl failed", error?.message);
    return NextResponse.json(
      { error: error?.message || "สร้างลิงก์อัปโหลดไม่สำเร็จ" },
      { status: 500 },
    );
  }

  const path = data.path || storagePath;
  const publicUrl = clientFacingUrl(kind, path);

  return NextResponse.json({
    mode: "sign",
    storagePath: path,
    token: data.token,
    signedUrl: data.signedUrl,
    publicUrl,
    persistUrl: publicUrl,
    private: isSensitiveUploadKind(kind),
    contentType: resolved,
    maxBytes,
    kind,
  });
}

async function proxyUpload(request: NextRequest, adminEmail: string) {
  const formData = await request.formData();
  const file = formData.get("file");
  const kindRaw = ((formData.get("kind") as string) || "").trim().toLowerCase();
  const category =
    (formData.get("category") as string)?.trim() ||
    (kindRaw && IMAGE_KINDS.has(kindRaw) ? `listings/${kindRaw}` : "general");

  // Default: image upload (backward compatible with ImageUploadField).
  const kind = kindRaw || "image";
  const doc = isDocKind(kind);

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "file is required (multipart field name: file)" },
      { status: 400 },
    );
  }

  const contentType = resolveContentType(kind, file);
  if (!contentType) {
    return NextResponse.json({ error: docKindError(kind) }, { status: 400 });
  }

  const maxBytes = doc ? DOC_MAX : IMAGE_MAX;
  if (file.size <= 0) {
    return NextResponse.json({ error: "ไฟล์ว่างเปล่า" }, { status: 400 });
  }
  if (file.size > maxBytes) {
    return NextResponse.json(
      {
        error: `ไฟล์ใหญ่เกินไป (${(file.size / 1024 / 1024).toFixed(1)}MB) — สูงสุด ${formatMb(maxBytes)}MB`,
      },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (
    (kind === "pdf" || kind === "document" || kind === "boq" || kind === "calc") &&
    !bufferLooksLikePdf(buffer)
  ) {
    return NextResponse.json(
      { error: "เนื้อหาไฟล์ไม่ใช่ PDF ที่ถูกต้อง — ตรวจว่าเป็นไฟล์ .pdf จริง" },
      { status: 400 },
    );
  }
  if (kind === "cad" && !looksLikeDwg(file)) {
    return NextResponse.json({ error: "อัปโหลดได้เฉพาะไฟล์ AutoCAD (.dwg)" }, { status: 400 });
  }
  if (kind === "calc" && !looksLikeCalcDoc(file)) {
    return NextResponse.json({ error: "อัปโหลดได้เฉพาะไฟล์ PDF (.pdf)" }, { status: 400 });
  }

  let uploadBuffer: Buffer = buffer;
  let uploadType = contentType;
  let uploadName = file.name;

  // Images → resize + WebP before storage (faster storefront LCP).
  if (!doc) {
    try {
      const { compressImageBuffer } = await import("@/lib/uploads/compress-image-server");
      const compressed = await compressImageBuffer(buffer, file.name, {
        maxEdge: 1600,
        quality: 78,
      });
      uploadBuffer = Buffer.from(compressed.buffer);
      uploadType = compressed.contentType;
      uploadName = compressed.fileName;
    } catch (err) {
      console.warn("[admin/upload] image compress skipped", err);
    }
  }

  const safeAdmin = adminEmail.replace(/[^a-zA-Z0-9_-]/g, "_") || "admin";
  const storagePath = doc
    ? siteAssetPath(`admin/${safeAdmin}/${kind}`, uploadName)
    : siteAssetPath(category, uploadName);
  const bucket = doc && isSensitiveUploadKind(kind) ? VENDOR_PRIVATE_BUCKET : SITE_ASSETS_BUCKET;

  const { error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .upload(storagePath, uploadBuffer, {
      contentType: uploadType,
      upsert: true,
      cacheControl: doc ? "3600" : "31536000",
    });

  if (error) {
    console.error("[admin/upload] Storage upload failed", {
      storagePath,
      bucket,
      message: error.message,
    });
    throw new Error(`อัปโหลด Storage ไม่สำเร็จ: ${error.message}`);
  }

  const publicUrl = clientFacingUrl(doc ? kind : "image", storagePath);

  return NextResponse.json({
    ok: true,
    storagePath,
    publicUrl,
    persistUrl: publicUrl,
    mimeType: uploadType,
    sizeBytes: uploadBuffer.byteLength,
    private: Boolean(doc && isSensitiveUploadKind(kind)),
    kind: doc ? kind : "image",
  });
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
