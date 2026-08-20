/** Post-payment notification settings (buyer SMS + admin LINE OA push). */

export interface OrderNotifySettings {
  /** When true, SMS the buyer phone after slip verification succeeds. */
  notifyBuyerSms: boolean;
  /** When true, push a LINE Messaging API text to adminLineUserId. */
  notifyAdminLine: boolean;
  /**
   * Admin LINE user ID (must be U… — NOT a lin.ee / line.me chat link).
   * Get this by having the admin add the Messaging API bot as a friend,
   * then read the userId from webhook events or LINE Developers tools.
   */
  adminLineUserId: string;
  /**
   * Optional token override. Falls back to loan_consultation token / LINE_CHANNEL_ACCESS_TOKEN.
   */
  lineChannelAccessToken: string;
}

export const DEFAULT_ORDER_NOTIFY_SETTINGS: OrderNotifySettings = {
  notifyBuyerSms: true,
  notifyAdminLine: true,
  adminLineUserId: "",
  lineChannelAccessToken: "",
};

export function normalizeOrderNotifySettings(
  raw: unknown,
): OrderNotifySettings {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    notifyBuyerSms: o.notifyBuyerSms !== false && o.notify_buyer_sms !== false,
    notifyAdminLine: o.notifyAdminLine !== false && o.notify_admin_line !== false,
    adminLineUserId: String(
      o.adminLineUserId ?? o.admin_line_user_id ?? "",
    )
      .trim()
      .slice(0, 80),
    lineChannelAccessToken: String(
      o.lineChannelAccessToken ?? o.line_channel_access_token ?? "",
    )
      .trim()
      .slice(0, 500),
  };
}
