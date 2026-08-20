import "server-only";

import sharp from "sharp";
import {
  getSlipmateApiKey,
  isSlipmateConfigured,
  SLIPMATE_API_BASE_URL,
  slipmateAllowDuplicate,
  slipmateMatchAmount,
} from "@/lib/payments/slipmate-config";

export type SlipVerifyOutcome =
  | { ok: true; verified: true; amount?: number; transRef?: string; raw: unknown }
  | { ok: true; verified: false; reason: string; raw: unknown }
  | {
      ok: false;
      error: string;
      /** Present when SLIPMATE_API_KEY / legacy alias is unset — callers should queue manual review. */
      code?: "missing_api_key";
      raw?: unknown;
    };

/**
 * SlipMate only accepts JPG/JPEG/PNG/JFIF/WEBP.
 * Phone/desktop uploads often use odd JPEG variants, HEIC, EXIF-heavy files, or
 * empty MIME — normalize to a clean JPEG (or PNG) before base64.
 */
async function normalizeSlipImageBytes(imageBytes: Buffer): Promise<{
  bytes: Buffer;
  mime: "image/jpeg" | "image/png" | "image/webp";
}> {
  try {
    const pipeline = sharp(imageBytes, { failOn: "none", animated: false }).rotate();
    const meta = await pipeline.metadata();
    const format = (meta.format || "").toLowerCase();

    if (format === "png") {
      const bytes = await pipeline.png({ compressionLevel: 8 }).toBuffer();
      return { bytes, mime: "image/png" };
    }
    if (format === "webp") {
      const bytes = await pipeline.webp({ quality: 90 }).toBuffer();
      return { bytes, mime: "image/webp" };
    }

    // Default path: JPEG (covers jpg/jpeg/jfif/heic/heif/bmp/tiff/gif/unknown)
    const bytes = await pipeline
      .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: "4:2:0" })
      .toBuffer();
    return { bytes, mime: "image/jpeg" };
  } catch (err) {
    console.warn("[slip-verify] sharp normalize failed — sending original bytes", err);
    return { bytes: imageBytes, mime: "image/jpeg" };
  }
}

function toSlipmateBase64(bytes: Buffer, mime: string): string {
  const b64 = bytes.toString("base64");
  // Prefer raw base64; some gateways choke on data-URI, but keep helper ready.
  void mime;
  return b64;
}

/**
 * Verify a bank transfer slip via SlipMate Open API
 * (`POST /v1/verify` with `qrImageBase64` + `X-API-KEY`).
 * @see https://developers.slipmate.ai/verify-by-base64-image-14006225e0
 */
export async function verifyBankSlip(opts: {
  imageBytes: Buffer;
  expectedAmountThb?: number;
}): Promise<SlipVerifyOutcome> {
  if (!isSlipmateConfigured()) {
    return {
      ok: false,
      code: "missing_api_key",
      error:
        "SlipMate API Key ยังไม่ได้ตั้งค่า — ใส่ SLIPMATE_API_KEY ใน Vercel Environment Variables (Production) แล้ว Redeploy",
    };
  }

  const apiKey = getSlipmateApiKey();
  const endpoint = `${SLIPMATE_API_BASE_URL}/v1/verify`;
  const normalized = await normalizeSlipImageBytes(opts.imageBytes);
  console.info("[slip-verify] normalized image", {
    inputBytes: opts.imageBytes.length,
    outputBytes: normalized.bytes.length,
    mime: normalized.mime,
    magic: normalized.bytes.subarray(0, 4).toString("hex"),
  });

  const attempts: { label: string; qrImageBase64: string }[] = [
    {
      label: "raw-base64",
      qrImageBase64: toSlipmateBase64(normalized.bytes, normalized.mime),
    },
    {
      label: "data-uri",
      qrImageBase64: `data:${normalized.mime};base64,${normalized.bytes.toString("base64")}`,
    },
  ];

  let lastRaw: unknown;
  let lastReason = "สลิปไม่ผ่านการตรวจสอบจาก SlipMate";

  for (const attempt of attempts) {
    let res: Response;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({
          qrImageBase64: attempt.qrImageBase64,
          allowDuplicate: slipmateAllowDuplicate(),
        }),
      });
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "เรียก SlipMate API ไม่สำเร็จ",
      };
    }

    const raw = await res.json().catch(() => ({
      message: res.statusText || `HTTP ${res.status}`,
    }));
    lastRaw = raw;

    if (!res.ok) {
      const reason = extractSlipmateMessage(raw, `SlipMate HTTP ${res.status}`);
      lastReason = reason;
      console.error("[slip-verify] SlipMate non-OK", {
        attempt: attempt.label,
        status: res.status,
        reason,
        raw,
      });
      // Retry with data-URI only when format rejected on first attempt.
      if (
        attempt.label === "raw-base64" &&
        /invalid image format|only jpg|jpeg|png|jfif|webp/i.test(reason)
      ) {
        continue;
      }
      return { ok: true, verified: false, reason, raw };
    }

    const data = unwrapSlipData(raw);
    if (!data) {
      const reason = extractSlipmateMessage(raw, "สลิปไม่ผ่านการตรวจสอบจาก SlipMate");
      lastReason = reason;
      console.error("[slip-verify] SlipMate OK but no slip data", {
        attempt: attempt.label,
        reason,
        raw,
      });
      if (
        attempt.label === "raw-base64" &&
        /invalid image format|only jpg|jpeg|png|jfif|webp/i.test(reason)
      ) {
        continue;
      }
      return { ok: true, verified: false, reason, raw };
    }

    const amount = readAmount(data);
    const transRef =
      typeof data.transRef === "string"
        ? data.transRef
        : typeof data.trans_ref === "string"
          ? String(data.trans_ref)
          : undefined;

    if (
      slipmateMatchAmount() &&
      opts.expectedAmountThb != null &&
      Number.isFinite(opts.expectedAmountThb) &&
      amount != null
    ) {
      const expected = Math.round(Number(opts.expectedAmountThb));
      const actual = Math.round(amount);
      if (actual !== expected) {
        return {
          ok: true,
          verified: false,
          reason: `ยอดเงินในสลิปไม่ตรงกับคำสั่งซื้อ (สลิป ฿${actual.toLocaleString("th-TH")} / ออเดอร์ ฿${expected.toLocaleString("th-TH")})`,
          raw,
        };
      }
    }

    console.info("[slip-verify] verified", {
      attempt: attempt.label,
      transRef,
      amount,
    });

    return {
      ok: true,
      verified: true,
      amount: amount != null && Number.isFinite(amount) ? amount : undefined,
      transRef,
      raw,
    };
  }

  return {
    ok: true,
    verified: false,
    reason: lastReason,
    raw: lastRaw,
  };
}

function unwrapSlipData(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  // Explicit failure payload
  if (
    o.code === "OPENAPI_FAILURE" ||
    (typeof o.statusCode === "number" && o.statusCode >= 400)
  ) {
    return null;
  }

  // Nested { data: SlipData }
  if (o.data && typeof o.data === "object") {
    const inner = o.data as Record<string, unknown>;
    if (inner.transRef || typeof inner.amount === "number") return inner;
  }

  // Flat SlipData
  if (o.transRef || typeof o.amount === "number") return o;

  return null;
}

function readAmount(data: Record<string, unknown>): number | undefined {
  if (typeof data.amount === "number" && Number.isFinite(data.amount)) {
    return data.amount;
  }
  if (typeof data.paidLocalAmount === "number" && Number.isFinite(data.paidLocalAmount)) {
    return data.paidLocalAmount;
  }
  return undefined;
}

/** Prefer SlipMate `message` / `error` / nested statusMessage. */
function extractSlipmateMessage(raw: unknown, fallback: string): string {
  if (!raw || typeof raw !== "object") return fallback;
  const o = raw as Record<string, unknown>;
  for (const key of ["message", "error", "statusMessage"] as const) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  if (o.data && typeof o.data === "object") {
    const d = o.data as Record<string, unknown>;
    for (const key of ["statusMessage", "message", "error"] as const) {
      const v = d[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return fallback;
}
