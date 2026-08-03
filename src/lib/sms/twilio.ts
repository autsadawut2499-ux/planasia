import "server-only";

export function isSmsConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      (process.env.TWILIO_FROM_NUMBER?.trim() || process.env.TWILIO_MESSAGING_SERVICE_SID?.trim()),
  );
}

export interface SendSmsResult {
  ok: boolean;
  sid?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Send an SMS via Twilio REST API. Never throws — callers log and continue.
 */
export async function sendSms(toE164: string, body: string): Promise<SendSmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID?.trim();

  if (!accountSid || !authToken || (!from && !messagingServiceSid)) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[sms] skipped — set TWILIO_* env to enable designer sale SMS", {
        to: toE164,
        preview: body.slice(0, 80),
      });
    }
    return { ok: false, skipped: true, error: "twilio_not_configured" };
  }

  const params = new URLSearchParams();
  params.set("To", toE164);
  params.set("Body", body);
  if (messagingServiceSid) {
    params.set("MessagingServiceSid", messagingServiceSid);
  } else if (from) {
    params.set("From", from);
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );
    const json = (await res.json()) as { sid?: string; message?: string; error_message?: string };
    if (!res.ok) {
      const error = json.error_message || json.message || `twilio_http_${res.status}`;
      console.error("[sms] twilio failed", { to: toE164, error });
      return { ok: false, error };
    }
    console.info("[sms] sent", { to: toE164, sid: json.sid });
    return { ok: true, sid: json.sid };
  } catch (err) {
    const error = err instanceof Error ? err.message : "twilio_network_error";
    console.error("[sms] send failed", err);
    return { ok: false, error };
  }
}
