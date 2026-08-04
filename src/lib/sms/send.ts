import "server-only";

import { isThaiBulkSmsConfigured, sendThaiBulkSms } from "@/lib/sms/thaibulksms";
import { isSmsConfigured as isTwilioConfigured, sendSms as sendTwilioSms } from "@/lib/sms/twilio";

export interface SendSmsResult {
  ok: boolean;
  sid?: string;
  messageId?: string;
  provider?: "thaibulksms" | "twilio";
  error?: string;
  skipped?: boolean;
}

/** True when ThaiBulkSMS (preferred) or Twilio fallback is configured. */
export function isSmsConfigured(): boolean {
  return isThaiBulkSmsConfigured() || isTwilioConfigured();
}

/**
 * Send SMS — prefer ThaiBulkSMS, fall back to Twilio.
 * Never throws.
 */
export async function sendSms(toE164: string, body: string): Promise<SendSmsResult> {
  if (isThaiBulkSmsConfigured()) {
    const result = await sendThaiBulkSms(toE164, body);
    return {
      ok: result.ok,
      messageId: result.messageId,
      sid: result.messageId,
      provider: "thaibulksms",
      error: result.error,
      skipped: result.skipped,
    };
  }

  if (isTwilioConfigured()) {
    const result = await sendTwilioSms(toE164, body);
    return {
      ok: result.ok,
      sid: result.sid,
      messageId: result.sid,
      provider: "twilio",
      error: result.error,
      skipped: result.skipped,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[sms] skipped — configure THAIBULKSMS_* or TWILIO_*", {
      to: toE164,
      preview: body.slice(0, 80),
    });
  }
  return { ok: false, skipped: true, error: "sms_not_configured" };
}
