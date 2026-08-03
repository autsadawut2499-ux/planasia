import { NextRequest, NextResponse } from "next/server";
import { requireVendorSession } from "@/lib/vendor/auth";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import {
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
import { compressImageBuffer } from "@/lib/uploads/compress-image-server";
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

const ALLOWED_KINDS = new Set([
  "avatar",
  "cover",
  "render",
  "floorplan",
  "pdf",
  "document",
  "boq",
  "cad",
  "calc",
  "kyc",
]);

function isDocKind(kind: string): boolean {
  return (
    kind === "pdf" ||
    kind === "document" ||
    kind === "boq" ||
    kind === "cad" ||
    kind === "calc"
  );
}

function docKindError(kind: string): string {
  if (kind === "cad") return "อัปโหลดได้เฉพาะไฟล์ AutoCAD (.dwg)";
  if (kind === "calc" || kind === "pdf" || kind === "document" || kind === "boq") {
    return "อัปโหลดได้เฉพาะไฟล์ PDF (.pdf)";
  }
  if (kind === "kyc") {
    return "KYC รับเฉพาะรูปภาพ (JPG, PNG, WEBP, GIF) — ไม่รับไฟล์ PDF";
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

/**
 * POST multipart → proxy upload through Next (images / small files).
 * POST JSON `{ mode: "sign", ... }` → signed upload URL.
 * Sensitive kinds (pdf/document/boq/kyc) land in private `vendor-private`.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireVendorSession(request);
    if (!auth.ok) return auth.response;

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: "Supabase ยังไม่ได้ตั้งค่า" }, { status: 503 });
    }

    const contentTypeHeader = request.headers.get("content-type") || "";
    if (contentTypeHeader.includes("application/json")) {
      return signUpload(request, auth.ownerKey);
    }

    return proxyUpload(request, auth.ownerKey);
  } catch (err) {
    const message = err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ";
    console.error("[vendor/upload]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function signUpload(request: NextRequest, ownerKey: string) {
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

  const kind = (body.kind || "").trim();
  const fileName = (body.fileName || "").trim();
  const sizeBytes = Number(body.sizeBytes ?? 0);

  if (!ALLOWED_KINDS.has(kind)) {
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
        error: `ไฟล์ใหญ่เกินไป (${(sizeBytes / 1024 / 1024).toFixed(1)}MB) — สูงสุด ${formatMb(maxBytes)}MB สำหรับ${
          isDocKind(kind) ? "เอกสาร PDF" : "รูปภาพ"
        }`,
      },
      { status: 400 },
    );
  }

  const resolved = resolveContentType(kind, {
    name: fileName,
    type: body.contentType,
  });
  if (!resolved) {
    return NextResponse.json(
      {
        error: docKindError(kind),
      },
      { status: 400 },
    );
  }

  const safeOwner = ownerKey.replace(/[^a-zA-Z0-9_-]/g, "_");
  const storagePath = siteAssetPath(`vendor/${safeOwner}/${kind}`, fileName);
  const bucket = bucketForKind(kind);

  const { data, error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .createSignedUploadUrl(storagePath, { upsert: true });

  if (error || !data) {
    console.error("[vendor/upload] createSignedUploadUrl failed", error?.message);
    return NextResponse.json(
      { error: error?.message || "สร้างลิงก์อัปโหลดไม่สำเร็จ" },
      { status: 500 },
    );
  }

  const path = data.path || storagePath;
  const persistUrl = persistUrlFor(kind, path);

  return NextResponse.json({
    mode: "sign",
    storagePath: path,
    token: data.token,
    signedUrl: data.signedUrl,
    /** Durable value to store in DB (private ref or public URL). */
    publicUrl: persistUrl,
    persistUrl,
    private: isSensitiveUploadKind(kind),
    contentType: resolved,
    maxBytes,
    kind,
  });
}

async function proxyUpload(request: NextRequest, ownerKey: string) {
  const formData = await request.formData();
  const file = formData.get("file");
  const kind = ((formData.get("kind") as string) || "render").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ต้องแนบไฟล์ (field: file)" }, { status: 400 });
  }
  if (!ALLOWED_KINDS.has(kind)) {
    return NextResponse.json({ error: "ชนิดไฟล์ไม่ถูกต้อง" }, { status: 400 });
  }

  const maxBytes = isDocKind(kind) ? DOC_MAX : IMAGE_MAX;
  const contentType = resolveContentType(kind, file);
  if (!contentType) {
    return NextResponse.json({ error: docKindError(kind) }, { status: 400 });
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
  // PDF magic-byte check for all PDF-only kinds (blueprint / BOQ / calc).
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
    return NextResponse.json(
      { error: "อัปโหลดได้เฉพาะไฟล์ AutoCAD (.dwg)" },
      { status: 400 },
    );
  }
  if (kind === "calc" && !looksLikeCalcDoc(file)) {
    return NextResponse.json(
      { error: "อัปโหลดได้เฉพาะไฟล์ PDF (.pdf)" },
      { status: 400 },
    );
  }

  let uploadBuffer: Buffer = Buffer.from(buffer);
  let uploadType = contentType;
  let uploadName = file.name;

  // Auto-compress images before storage (resize + WebP) for faster storefront LCP.
  if (!isDocKind(kind)) {
    try {
      const compressed = await compressImageBuffer(buffer, file.name, {
        maxEdge: kind === "kyc" ? 1600 : undefined,
        quality: kind === "kyc" ? 85 : undefined,
      });
      uploadBuffer = Buffer.from(compressed.buffer);
      uploadType = compressed.contentType;
      uploadName = compressed.fileName;
    } catch (err) {
      console.warn("[vendor/upload] image compress skipped", err);
    }
  }

  const safeOwner = ownerKey.replace(/[^a-zA-Z0-9_-]/g, "_");
  const storagePath = siteAssetPath(`vendor/${safeOwner}/${kind}`, uploadName);
  const bucket = bucketForKind(kind);

  const { error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .upload(storagePath, uploadBuffer, { contentType: uploadType, upsert: true });
  if (error) throw error;

  const persistUrl = persistUrlFor(kind, storagePath);

  return NextResponse.json({
    storagePath,
    publicUrl: persistUrl,
    persistUrl,
    private: isSensitiveUploadKind(kind),
    mimeType: uploadType,
    sizeBytes: uploadBuffer.length,
    kind,
  });
}
