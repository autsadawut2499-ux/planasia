import "server-only";

/**
 * ThaiBulkSMS API v2 client.
 * Docs: https://developer.thaibulksms.com/reference/post_sms
 *
 * Auth: API Key + API Secret (Basic)
 * Body: application/x-www-form-urlencoded (API expects this; JSON often 400s)
 * Phone: msisdn without "+" (e.g. 66812345678)
 * Sender: omit unless THAIBULKSMS_SENDER is an approved Sender Name
 */

const THAIBULKSMS_SMS_URL = "https://api-v2.thaibulksms.com/sms";

function envFirst(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

/** Prefer THAIBULKSMS_*; accept THAI_BULK_SMS_* aliases from the console naming. */
export function getThaiBulkSmsCredentials(): {
  apiKey: string;
  apiSecret: string;
  /** Empty = let ThaiBulkSMS use account default sender. */
  sender: string;
  force: string;
} {
  return {
    apiKey: envFirst("THAIBULKSMS_API_KEY", "THAI_BULK_SMS_API_KEY"),
    apiSecret: envFirst("THAIBULKSMS_API_SECRET", "THAI_BULK_SMS_API_SECRET"),
    // Do NOT default to "SMS" — unapproved sender names return HTTP 400.
    sender: envFirst("THAIBULKSMS_SENDER", "THAI_BULK_SMS_SENDER"),
    force: (envFirst("THAIBULKSMS_FORCE", "THAI_BULK_SMS_FORCE") || "standard").toLowerCase(),
  };
}

export function isThaiBulkSmsConfigured(): boolean {
  const { apiKey, apiSecret } = getThaiBulkSmsCredentials();
  return Boolean(apiKey && apiSecret);
}

export interface ThaiBulkSendResult {
  ok: boolean;
  messageId?: string;
  phone?: string;
  error?: string;
  skipped?: boolean;
  raw?: unknown;
}

/** Convert E.164 (+66…) to ThaiBulkSMS msisdn (66…). */
export function toThaiBulkMsisdn(e164: string): string | null {
  const digits = e164.trim().replace(/[^\d]/g, "");
  if (digits.startsWith("66") && digits.length === 11) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `66${digits.slice(1)}`;
  if (digits.length >= 10 && digits.length <= 15) return digits;
  return null;
}

/**
 * Send one SMS via ThaiBulkSMS. Never throws.
 */
export async function sendThaiBulkSms(
  toE164: string,
  message: string,
): Promise<ThaiBulkSendResult> {
  const { apiKey, apiSecret, sender, force } = getThaiBulkSmsCredentials();

  if (!apiKey || !apiSecret) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[sms/thaibulksms] skipped — set THAIBULKSMS_API_KEY/SECRET (or THAI_BULK_SMS_*)",
        {
          to: toE164,
          preview: message.slice(0, 80),
        },
      );
    }
    return { ok: false, skipped: true, error: "thaibulksms_not_configured" };
  }

  const msisdn = toThaiBulkMsisdn(toE164);
  if (!msisdn) {
    return { ok: false, error: "invalid_phone" };
  }

  const params = new URLSearchParams();
  params.set("msisdn", msisdn);
  params.set("message", message);
  params.set(
    "force",
    force === "premium" || force === "corporate" ? force : "standard",
  );
  // Only send sender when explicitly configured (must be pre-approved).
  if (sender) params.set("sender", sender);

  try {
    const res = await fetch(THAIBULKSMS_SMS_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });

    const text = await res.text();
    type ThaiBulkResponse = {
      phone_number?: string;
      message_id?: string | number;
      remaining_credit?: number;
      total_use_credit?: number;
      credit_type?: string;
      error?: string | { message?: string; code?: string | number };
      message?: string;
      code?: string | number;
      phone_number_list?: Array<{
        number?: string;
        phone_number?: string;
        message_id?: string | number;
      }>;
      bad_phone_number_list?: unknown[];
    };
    let json: ThaiBulkResponse | null = null;
    try {
      json = text ? (JSON.parse(text) as ThaiBulkResponse) : null;
    } catch {
      json = null;
    }

    // ThaiBulkSMS returns 201 Created on success.
    if (!res.ok) {
      const errField = json?.error;
      const error =
        (typeof errField === "string" ? errField : "") ||
        (errField && typeof errField === "object" ? errField.message || "" : "") ||
        json?.message ||
        (text ? text.slice(0, 180) : `thaibulksms_http_${res.status}`);
      console.error("[sms/thaibulksms] send failed", {
        to: msisdn,
        error: String(error),
        status: res.status,
        sender: sender || "(account-default)",
        body: text.slice(0, 300),
      });
      return { ok: false, error: String(error), raw: json ?? text };
    }

    const listItem = json?.phone_number_list?.[0];
    const messageId =
      String(json?.message_id ?? listItem?.message_id ?? "").trim() || undefined;
    const phone = String(
      json?.phone_number ?? listItem?.phone_number ?? listItem?.number ?? msisdn,
    );

    console.info("[sms/thaibulksms] sent", {
      to: phone,
      messageId,
      creditType: json?.credit_type,
      remaining: json?.remaining_credit,
    });
    return { ok: true, messageId, phone, raw: json };
  } catch (err) {
    const error = err instanceof Error ? err.message : "thaibulksms_network_error";
    console.error("[sms/thaibulksms] network error", err);
    return { ok: false, error };
  }
}
