/** Admin + runtime settings for loan consultation LINE delivery. */

export interface LoanConsultationSettings {
  /**
   * Expert LINE OA chat URL (e.g. https://line.me/R/ti/p/@account).
   * Used for the public “Contact via LINE” button and as the configured destination reference.
   */
  expertLineOaUrl: string;
  /**
   * LINE user ID of the expert who added the Messaging API bot as a friend.
   * Required to push the consultation PDF link (LINE cannot deliver to a chat URL alone).
   */
  expertLineUserId: string;
  /**
   * LINE Messaging API channel access token.
   * Falls back to LINE_CHANNEL_ACCESS_TOKEN env when empty.
   */
  lineChannelAccessToken: string;
}

export const DEFAULT_LOAN_CONSULTATION_SETTINGS: LoanConsultationSettings = {
  expertLineOaUrl: "",
  expertLineUserId: "",
  lineChannelAccessToken: "",
};

export function normalizeLoanConsultationSettings(
  raw: unknown,
): LoanConsultationSettings {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    expertLineOaUrl: String(o.expertLineOaUrl ?? o.expert_line_oa_url ?? "")
      .trim()
      .slice(0, 500),
    expertLineUserId: String(o.expertLineUserId ?? o.expert_line_user_id ?? "")
      .trim()
      .slice(0, 80),
    lineChannelAccessToken: String(
      o.lineChannelAccessToken ?? o.line_channel_access_token ?? "",
    )
      .trim()
      .slice(0, 500),
  };
}

/** Normalize a LINE chat URL or @id into an https link. */
export function resolveLineChatUrl(raw: string): string {
  const v = raw.trim();
  if (!v || v.includes("YOUR_LINE")) return "";
  if (v.startsWith("http")) return v;
  return `https://line.me/R/ti/p/${encodeURIComponent(v.replace(/^@/, ""))}`;
}
