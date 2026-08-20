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
const THAIBULKSMS_CREDIT_URL = "https://api-v2.thaibulksms.com/credit";

type SmsForce = "standard" | "corporate" | "premium";

function envFirst(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

function normalizeForce(raw: string): SmsForce {
  const force = raw.toLowerCase();
  if (force === "premium" || force === "corporate") return force;
  return "standard";
}

function basicAuth(apiKey: string, apiSecret: string): string {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`;
}

function asCreditCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Prefer THAIBULKSMS_*; accept THAI_BULK_SMS_* aliases from the console naming. */
export function getThaiBulkSmsCredentials(): {
  apiKey: string;
  apiSecret: string;
  /** Empty = let ThaiBulkSMS use account default sender. */
  sender: string;
  force: SmsForce;
} {
  return {
    apiKey: envFirst("THAIBULKSMS_API_KEY", "THAI_BULK_SMS_API_KEY"),
    apiSecret: envFirst("THAIBULKSMS_API_SECRET", "THAI_BULK_SMS_API_SECRET"),
    // Do NOT default to "SMS" — unapproved sender names return HTTP 400.
    sender: envFirst("THAIBULKSMS_SENDER", "THAI_BULK_SMS_SENDER"),
    force: normalizeForce(envFirst("THAIBULKSMS_FORCE", "THAI_BULK_SMS_FORCE") || "standard"),
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

type CreditBag = Record<SmsForce, number>;

/**
 * Read remaining ThaiBulkSMS credits. Never throws.
 * Account may have standard=0 while corporate/premium still have balance.
 */
async function loadThaiBulkCredits(
  apiKey: string,
  apiSecret: string,
): Promise<CreditBag | null> {
  try {
    const res = await fetch(THAIBULKSMS_CREDIT_URL, {
      method: "GET",
      headers: {
        Authorization: basicAuth(apiKey, apiSecret),
        Accept: "application/json",
      },
    });
    const json = (await res.json().catch(() => null)) as
      | {
          remaining_credit?: number | CreditBag;
          remaining?: number | CreditBag;
          credit?: number | CreditBag;
        }
      | null;
    if (!res.ok || !json) return null;
    const remaining = json.remaining_credit ?? json.remaining ?? json.credit;
    if (remaining && typeof remaining === "object") {
      return {
        standard: asCreditCount((remaining as CreditBag).standard),
        corporate: asCreditCount((remaining as CreditBag).corporate),
        premium: asCreditCount((remaining as CreditBag).premium),
      };
    }
    return null;
  } catch (err) {
    console.warn("[sms/thaibulksms] credit lookup failed", err);
    return null;
  }
}

function pickForce(configured: SmsForce, credits: CreditBag | null): SmsForce {
  if (credits && credits[configured] > 0) return configured;
  if (credits) {
    if (credits.corporate > 0) return "corporate";
    if (credits.premium > 0) return "premium";
    if (credits.standard > 0) return "standard";
  }
  return configured;
}

function isCreditError(error: string, status: number): boolean {
  const e = error.toLowerCase();
  return (
    status === 402 ||
    e.includes("credit") ||
    e.includes("balance") ||
    e.includes("insufficient") ||
    e.includes("not enough")
  );
}

type ThaiBulkResponse = {
  phone_number?: string;
  message_id?: string | number;
  remaining_credit?: number | CreditBag;
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

async function postThaiBulkSms(opts: {
  apiKey: string;
  apiSecret: string;
  sender: string;
  force: SmsForce;
  msisdn: string;
  message: string;
}): Promise<ThaiBulkSendResult & { status?: number }> {
  const params = new URLSearchParams();
  params.set("msisdn", opts.msisdn);
  params.set("message", opts.message);
  params.set("force", opts.force);
  if (opts.sender) params.set("sender", opts.sender);

  const res = await fetch(THAIBULKSMS_SMS_URL, {
    method: "POST",
    headers: {
      Authorization: basicAuth(opts.apiKey, opts.apiSecret),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params.toString(),
  });

  const text = await res.text();
  let json: ThaiBulkResponse | null = null;
  try {
    json = text ? (JSON.parse(text) as ThaiBulkResponse) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const errField = json?.error;
    const error =
      (typeof errField === "string" ? errField : "") ||
      (errField && typeof errField === "object" ? errField.message || "" : "") ||
      json?.message ||
      (text ? text.slice(0, 180) : `thaibulksms_http_${res.status}`);
    console.error("[sms/thaibulksms] send failed", {
      to: opts.msisdn,
      error: String(error),
      status: res.status,
      force: opts.force,
      sender: opts.sender || "(account-default)",
      body: text.slice(0, 300),
    });
    return { ok: false, error: String(error), raw: json ?? text, status: res.status };
  }

  const listItem = json?.phone_number_list?.[0];
  const messageId =
    String(json?.message_id ?? listItem?.message_id ?? "").trim() || undefined;
  const phone = String(
    json?.phone_number ?? listItem?.phone_number ?? listItem?.number ?? opts.msisdn,
  );

  console.info("[sms/thaibulksms] sent", {
    to: phone,
    messageId,
    force: opts.force,
    creditType: json?.credit_type,
    remaining: json?.remaining_credit,
  });
  return { ok: true, messageId, phone, raw: json };
}

/**
 * Send one SMS via ThaiBulkSMS. Never throws.
 * If the configured force type is out of credit, automatically retries
 * corporate / premium / standard that still has remaining balance.
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

  const credits = await loadThaiBulkCredits(apiKey, apiSecret);
  const primary = pickForce(force, credits);
  const fallbacks: SmsForce[] = (["corporate", "premium", "standard"] as const).filter(
    (f) => f !== primary && (!credits || credits[f] > 0),
  );

  try {
    let last = await postThaiBulkSms({
      apiKey,
      apiSecret,
      sender,
      force: primary,
      msisdn,
      message,
    });
    if (last.ok) return last;

    if (isCreditError(last.error || "", last.status ?? 0)) {
      for (const next of fallbacks) {
        console.warn("[sms/thaibulksms] retrying with alternate credit type", {
          from: primary,
          to: next,
        });
        last = await postThaiBulkSms({
          apiKey,
          apiSecret,
          sender,
          force: next,
          msisdn,
          message,
        });
        if (last.ok) return last;
      }
    }
    return last;
  } catch (err) {
    const error = err instanceof Error ? err.message : "thaibulksms_network_error";
    console.error("[sms/thaibulksms] network error", err);
    return { ok: false, error };
  }
}
