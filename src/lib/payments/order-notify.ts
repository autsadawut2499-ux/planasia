import "server-only";

import type { CartOrder } from "@/lib/store/cart-orders";
import { pushLineTextMessage } from "@/lib/line/push-text";
import { toE164Phone } from "@/lib/sms/phone";
import { isSmsConfigured, sendSms } from "@/lib/sms/send";
import {
  loadOrderNotifySettings,
  resolveOrderNotifyLineToken,
} from "@/lib/supabase/order-notify-settings";

export type OrderNotifyResult = {
  buyerSms: "sent" | "skipped" | "failed";
  buyerSmsError?: string;
  adminLine: "sent" | "skipped" | "failed";
  adminLineError?: string;
};

function buildBuyerSms(order: CartOrder): string {
  const plans = order.items.map((i) => i.planId).join(", ");
  return [
    "Planasia: การสั่งซื้อสำเร็จ",
    `รหัสออเดอร์ ${order.id}`,
    plans ? `แบบบ้าน ${plans}` : null,
    "เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง",
    "เอกสารจะถูกส่งภายใน 3-5 วัน",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildAdminLineText(order: CartOrder): string {
  const lines = order.items
    .map((i) => `• ${i.planId} — ${i.name} (฿${Math.round(i.price).toLocaleString("th-TH")})`)
    .join("\n");
  const sitePlan = order.sitePlanInfo
    ? [
        "",
        "ข้อมูลแผนผังบริเวณ:",
        `จ.${order.sitePlanInfo.provinceName}`,
        `อ.${order.sitePlanInfo.districtName}`,
        `โฉนด ${order.sitePlanInfo.landTitleDeedNumber}`,
      ].join("\n")
    : "";

  return [
    "✅ มีการชำระเงินสำเร็จ (SlipMate)",
    "",
    `ออเดอร์: ${order.id}`,
    `ลูกค้า: ${order.buyerName?.trim() || "—"}`,
    `โทร: ${order.buyerPhone?.trim() || "—"}`,
    order.buyerEmail ? `อีเมล: ${order.buyerEmail.trim()}` : null,
    `ยอด: ฿${Math.round(order.total).toLocaleString("th-TH")}`,
    "",
    "รายการ:",
    lines || "—",
    sitePlan,
    "",
    `แอดมิน: /admin/orders`,
  ]
    .filter((x) => x != null)
    .join("\n");
}

/**
 * After slip verification / paid:
 *  1) SMS buyer phone (ThaiBulkSMS / Twilio)
 *  2) LINE Messaging API push to admin user id (OA bot → admin)
 *
 * Never throws. LINE chat URLs (lin.ee) cannot receive pushes — needs U… user id.
 */
export async function notifyAfterOrderPaid(
  order: CartOrder,
): Promise<OrderNotifyResult> {
  const settings = await loadOrderNotifySettings();
  const result: OrderNotifyResult = {
    buyerSms: "skipped",
    adminLine: "skipped",
  };

  // ── Buyer SMS ───────────────────────────────────────────────────────────
  if (settings.notifyBuyerSms) {
    const phone = toE164Phone(order.buyerPhone);
    if (!phone) {
      result.buyerSms = "skipped";
      result.buyerSmsError = "no_buyer_phone";
      console.info("[order-notify] buyer SMS skipped — no phone on order", order.id);
    } else if (!isSmsConfigured()) {
      result.buyerSms = "skipped";
      result.buyerSmsError = "sms_not_configured";
      console.info("[order-notify] buyer SMS skipped — SMS provider not configured");
    } else {
      const sms = await sendSms(phone, buildBuyerSms(order));
      if (sms.ok) {
        result.buyerSms = "sent";
        console.info("[order-notify] buyer SMS sent", {
          orderId: order.id,
          provider: sms.provider,
          messageId: sms.messageId,
        });
      } else if (sms.skipped) {
        result.buyerSms = "skipped";
        result.buyerSmsError = sms.error;
      } else {
        result.buyerSms = "failed";
        result.buyerSmsError = sms.error;
        console.error("[order-notify] buyer SMS failed", sms.error);
      }
    }
  }

  // ── Admin LINE ──────────────────────────────────────────────────────────
  if (settings.notifyAdminLine) {
    const token = await resolveOrderNotifyLineToken(settings);
    const to = settings.adminLineUserId.trim();
    if (!to) {
      result.adminLine = "skipped";
      result.adminLineError =
        "ยังไม่ได้ตั้งค่า Admin LINE User ID (แอดมิน → การตั้งค่าการชำระเงิน) — ลิงก์ lin.ee ใช้เปิดแชทได้ แต่ส่งแจ้งเตือนอัตโนมัติไม่ได้ ต้องใช้รหัส U…";
      console.warn("[order-notify] admin LINE skipped — missing adminLineUserId");
    } else {
      const line = await pushLineTextMessage({
        channelAccessToken: token,
        toUserId: to,
        text: buildAdminLineText(order),
      });
      if (line.ok) {
        result.adminLine = "sent";
        console.info("[order-notify] admin LINE sent", { orderId: order.id });
      } else if (line.skipped) {
        result.adminLine = "skipped";
        result.adminLineError = line.error;
        console.warn("[order-notify] admin LINE skipped", line.error);
      } else {
        result.adminLine = "failed";
        result.adminLineError = line.error;
        console.error("[order-notify] admin LINE failed", line.error);
      }
    }
  }

  return result;
}
