import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  isPrivateAssetRef,
  parsePrivateAssetRef,
  toPrivateAssetRef,
} from "@/lib/supabase/private-asset-ref";

export {
  isPrivateAssetRef,
  parsePrivateAssetRef,
  toPrivateAssetRef,
} from "@/lib/supabase/private-asset-ref";

/** Private bucket for KYC identity photos and paid blueprint / BOQ PDFs. */
export const VENDOR_PRIVATE_BUCKET = "vendor-private";

export type SensitiveUploadKind =
  | "pdf"
  | "document"
  | "boq"
  | "cad"
  | "calc"
  | "kyc";

export function isSensitiveUploadKind(kind: string): kind is SensitiveUploadKind {
  return (
    kind === "pdf" ||
    kind === "document" ||
    kind === "boq" ||
    kind === "cad" ||
    kind === "calc" ||
    kind === "kyc"
  );
}

export async function createPrivateSignedReadUrl(
  refOrPath: string,
  expiresSec = 60 * 60,
): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const parsed = isPrivateAssetRef(refOrPath)
    ? parsePrivateAssetRef(refOrPath)
    : { bucket: VENDOR_PRIVATE_BUCKET, path: refOrPath.replace(/^\/+/, "") };
  if (!parsed) return null;

  const { data, error } = await getSupabaseAdmin()
    .storage.from(parsed.bucket)
    .createSignedUrl(parsed.path, expiresSec);
  if (error || !data?.signedUrl) {
    console.error("[private-assets] signed URL failed", error?.message);
    return null;
  }
  return data.signedUrl;
}

/**
 * Upload bytes to the private vendor bucket and return a planasia-private:// ref.
 * Used for post-payment translated blueprint PDFs.
 */
export async function uploadPrivateBytes(opts: {
  path: string;
  bytes: Buffer;
  contentType?: string;
  upsert?: boolean;
}): Promise<string | null> {
  const result = await uploadPrivateBytesDetailed(opts);
  return result.ref;
}

/** Same as uploadPrivateBytes, but surfaces the storage error message. */
export async function uploadPrivateBytesDetailed(opts: {
  path: string;
  bytes: Buffer;
  contentType?: string;
  upsert?: boolean;
}): Promise<{ ref: string | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { ref: null, error: "Supabase is not configured" };
  }
  const path = opts.path.replace(/^\/+/, "");
  if (!path) return { ref: null, error: "Empty storage path" };

  const { error } = await getSupabaseAdmin()
    .storage.from(VENDOR_PRIVATE_BUCKET)
    .upload(path, opts.bytes, {
      contentType: opts.contentType || "application/octet-stream",
      upsert: opts.upsert !== false,
    });
  if (error) {
    console.error("[private-assets] upload failed", error.message, {
      path,
      contentType: opts.contentType,
    });
    return { ref: null, error: error.message };
  }
  return { ref: toPrivateAssetRef(VENDOR_PRIVATE_BUCKET, path), error: null };
}

/** Fetch bytes for download stamping — supports private refs and legacy public URLs. */
export async function fetchAssetBytes(
  urlOrRef: string,
): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!urlOrRef) return null;

  if (isPrivateAssetRef(urlOrRef)) {
    if (!isSupabaseConfigured()) return null;
    const parsed = parsePrivateAssetRef(urlOrRef);
    if (!parsed) return null;
    const { data, error } = await getSupabaseAdmin()
      .storage.from(parsed.bucket)
      .download(parsed.path);
    if (error || !data) {
      console.error("[private-assets] download failed", error?.message);
      return null;
    }
    const bytes = Buffer.from(await data.arrayBuffer());
    return { bytes, contentType: data.type || "application/octet-stream" };
  }

  try {
    const upstream = await fetch(urlOrRef, { cache: "no-store" });
    if (!upstream.ok) return null;
    const bytes = Buffer.from(await upstream.arrayBuffer());
    return {
      bytes,
      contentType: upstream.headers.get("content-type") || "application/octet-stream",
    };
  } catch {
    return null;
  }
}
