import "server-only";

export interface LinePushResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

/** LINE Messaging API user IDs look like U + 32 hex chars. */
export function isValidLineUserId(raw: string | null | undefined): boolean {
  const id = String(raw ?? "").trim();
  return /^U[0-9a-fA-F]{32}$/.test(id);
}

/**
 * True when the value looks like a chat/OA URL instead of a Messaging API user id.
 * (Common misconfiguration: pasting lin.ee / line.me links into the User ID field.)
 */
export function looksLikeLineChatUrl(raw: string | null | undefined): boolean {
  const v = String(raw ?? "").trim().toLowerCase();
  if (!v) return false;
  return (
    v.includes("http://") ||
    v.includes("https://") ||
    v.includes("lin.ee") ||
    v.includes("line.me") ||
    v.startsWith("@")
  );
}

/**
 * Push a plain-text message via LINE Messaging API.
 * @see https://developers.line.biz/en/reference/messaging-api/#send-push-message
 */
export async function pushLineTextMessage(opts: {
  channelAccessToken: string;
  toUserId: string;
  text: string;
}): Promise<LinePushResult> {
  const token = opts.channelAccessToken.trim();
  const to = opts.toUserId.trim();
  if (!token) {
    return {
      ok: false,
      skipped: true,
      error: "LINE Channel Access Token ยังไม่ได้ตั้งค่า",
    };
  }
  if (looksLikeLineChatUrl(to)) {
    return {
      ok: false,
      skipped: true,
      error:
        "ช่อง Expert/Admin LINE User ID ต้องเป็นรหัส U… จาก Messaging API ไม่ใช่ลิงก์ lin.ee / line.me",
    };
  }
  if (!isValidLineUserId(to)) {
    return {
      ok: false,
      skipped: true,
      error:
        "LINE User ID ไม่ถูกต้อง — ต้องขึ้นต้นด้วย U และยาว 33 ตัวอักษร (เช่น Ua1b2c3…)",
    };
  }

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to,
      messages: [{ type: "text", text: opts.text.slice(0, 4900) }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      ok: false,
      error: `LINE API ${res.status}: ${body.slice(0, 300) || res.statusText}`,
    };
  }
  return { ok: true };
}
