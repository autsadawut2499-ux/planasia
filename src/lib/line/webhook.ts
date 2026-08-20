import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export function getLineChannelSecret(): string {
  return process.env.LINE_CHANNEL_SECRET?.trim() || "";
}

export function getLineChannelId(): string {
  return process.env.LINE_CHANNEL_ID?.trim() || "";
}

/** Verify `X-Line-Signature` against the raw request body. */
export function verifyLineWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  channelSecret = getLineChannelSecret(),
): boolean {
  if (!channelSecret || !signatureHeader) return false;
  const digest = createHmac("sha256", channelSecret)
    .update(rawBody, "utf8")
    .digest("base64");
  try {
    const a = Buffer.from(digest);
    const b = Buffer.from(signatureHeader);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export type LineWebhookEvent = {
  type?: string;
  timestamp?: number;
  source?: {
    type?: string;
    userId?: string;
    groupId?: string;
    roomId?: string;
  };
  replyToken?: string;
  message?: { type?: string; text?: string };
  follow?: unknown;
  unfollow?: unknown;
};

export type LineWebhookBody = {
  destination?: string;
  events?: LineWebhookEvent[];
};
