import { NextRequest, NextResponse } from "next/server";
import {
  patchSaleNotificationByMessageId,
  recordSmsDeliveryEvent,
} from "@/lib/sms/delivery-log";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * ThaiBulkSMS delivery-status webhook (seller sale-alert SMS).
 *
 * Configure in ThaiBulkSMS API Key settings:
 *   https://planasia.net/api/webhooks/sms-seller
 *
 * Optional shared secret (query or header):
 *   https://planasia.net/api/webhooks/sms-seller?token=YOUR_SECRET
 *   Header: x-thaibulksms-token: YOUR_SECRET
 *   Env: THAIBULKSMS_WEBHOOK_SECRET
 *
 * Accepts JSON or application/x-www-form-urlencoded with common field names
 * (message_id, status, msisdn / phone_number, credit, …).
 */
export async function GET(request: NextRequest) {
  // ThaiBulkSMS console may call GET with status fields in the query string.
  const queryPayload = Object.fromEntries(request.nextUrl.searchParams.entries());
  const hasDeliveryFields = Boolean(
    queryPayload.message_id ||
      queryPayload.messageId ||
      queryPayload.status ||
      queryPayload.msisdn ||
      queryPayload.phone_number,
  );

  if (hasDeliveryFields) {
    return handleDeliveryCallback(request, queryPayload);
  }

  return NextResponse.json({
    ok: true,
    endpoint: "/api/webhooks/sms-seller",
    provider: "thaibulksms",
    purpose: "Seller sale-alert SMS delivery status",
  });
}

export async function POST(request: NextRequest) {
  const payload = await parseBody(request);
  return handleDeliveryCallback(request, payload);
}

async function handleDeliveryCallback(
  request: NextRequest,
  payload: Record<string, unknown>,
) {
  if (!authorizeWebhook(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messageId = firstString(payload, [
    "message_id",
    "messageId",
    "sms_id",
    "smsId",
    "msgid",
    "id",
  ]);
  const phone = firstString(payload, [
    "msisdn",
    "phone_number",
    "phoneNumber",
    "phone",
    "mobile",
    "to",
  ]);
  const status = firstString(payload, [
    "status",
    "delivery_status",
    "deliveryStatus",
    "state",
    "result",
  ]);
  const statusCode = firstString(payload, [
    "status_code",
    "statusCode",
    "code",
    "error_code",
    "errorCode",
  ]);
  const creditRaw = firstString(payload, ["credit", "used_credit", "usedCredit"]);
  const credit = creditRaw != null && creditRaw !== "" ? Number(creditRaw) : null;

  console.info("[sms-seller-webhook] delivery update", {
    messageId,
    phone,
    status,
    statusCode,
  });

  await recordSmsDeliveryEvent({
    provider: "thaibulksms",
    messageId,
    phone,
    status,
    statusCode,
    credit: Number.isFinite(credit) ? credit : null,
    raw: payload,
  });

  if (messageId && status) {
    const normalized = normalizeDeliveryStatus(status, statusCode);
    if (normalized) {
      await patchSaleNotificationByMessageId(messageId, {
        smsStatus: normalized,
        smsError: normalized === "failed" ? statusCode || status : null,
      });
    }
  }

  // ThaiBulkSMS expects a quick 2xx acknowledgement.
  return NextResponse.json({ ok: true, received: true });
}

function authorizeWebhook(request: NextRequest): boolean {
  const secret = process.env.THAIBULKSMS_WEBHOOK_SECRET?.trim();
  if (!secret) return true; // open endpoint when secret not set (log-only)

  const q = request.nextUrl.searchParams.get("token")?.trim();
  const header =
    request.headers.get("x-thaibulksms-token")?.trim() ||
    request.headers.get("x-webhook-token")?.trim();
  return q === secret || header === secret;
}

async function parseBody(request: NextRequest): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const json = await request.json();
      if (json && typeof json === "object" && !Array.isArray(json)) {
        return json as Record<string, unknown>;
      }
      return { data: json };
    }

    if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const form = await request.formData();
      const out: Record<string, unknown> = {};
      form.forEach((value, key) => {
        out[key] = typeof value === "string" ? value : value.name;
      });
      return out;
    }

    const text = await request.text();
    if (!text.trim()) return {};
    try {
      const json = JSON.parse(text) as unknown;
      if (json && typeof json === "object" && !Array.isArray(json)) {
        return json as Record<string, unknown>;
      }
    } catch {
      /* fall through — treat as query-style body */
    }
    const params = new URLSearchParams(text);
    const out: Record<string, unknown> = {};
    params.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  } catch (err) {
    console.error("[sms-seller-webhook] parse body failed", err);
    return {};
  }
}

function firstString(
  payload: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (value == null) continue;
    const s = String(value).trim();
    if (s) return s;
  }
  return null;
}

function normalizeDeliveryStatus(
  status: string,
  statusCode: string | null,
): "sent" | "failed" | null {
  const s = status.toLowerCase();
  const code = (statusCode || "").toLowerCase();

  if (
    s.includes("deliver") ||
    s === "success" ||
    s === "sent" ||
    s === "ok" ||
    s === "1" ||
    code === "000" ||
    code === "0"
  ) {
    return "sent";
  }

  if (
    s.includes("fail") ||
    s.includes("error") ||
    s.includes("reject") ||
    s.includes("undeliver") ||
    s === "0" ||
    code.startsWith("e")
  ) {
    return "failed";
  }

  // pending / queued / sending — keep as-is (no overwrite to sent/failed)
  return null;
}
