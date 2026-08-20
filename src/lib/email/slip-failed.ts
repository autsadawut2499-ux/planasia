import "server-only";

import type { CartOrder } from "@/lib/store/cart-orders";
import { getEmailFrom, getResendApiKey, SUPPORT_EMAIL } from "@/lib/email/config";

/** Notify buyer that slip verification failed — they should re-upload. */
export async function sendSlipFailedEmail(
  order: CartOrder,
  reason: string,
): Promise<boolean> {
  const email = order.buyerEmail?.trim();
  const apiKey = getResendApiKey();
  if (!email || !apiKey) return false;

  const thai = (order.documentLanguage ?? "th") === "th";
  const amount = `฿${Number(order.total).toLocaleString("th-TH")}`;
  const subject = thai
    ? `โอนเงินไม่ถูกต้อง — กรุณาอัปโหลดสลิปใหม่ (#${order.id})`
    : `Invalid transfer — please re-upload your slip (#${order.id})`;

  const html = thai
    ? `<p>สวัสดี${order.buyerName ? ` คุณ${order.buyerName}` : ""},</p>
<p>ระบบตรวจสอบสลิปของคำสั่งซื้อ <strong>${order.id}</strong> (ยอด ${amount}) แล้วพบว่า<strong>โอนเงินไม่ถูกต้อง</strong></p>
<p>เหตุผล: ${escapeHtml(reason)}</p>
<p>กรุณากลับไปที่หน้าชำระเงินและอัปโหลดสลิปใหม่อีกครั้ง หากโอนถูกต้องแล้วแต่ยังไม่ผ่าน กรุณาติดต่อ <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
<p>— Planasia</p>`
    : `<p>Hello${order.buyerName ? ` ${order.buyerName}` : ""},</p>
<p>We could not verify the transfer slip for order <strong>${order.id}</strong> (${amount}). Status: <strong>invalid transfer</strong>.</p>
<p>Reason: ${escapeHtml(reason)}</p>
<p>Please return to checkout and re-upload a valid slip. If you need help, contact <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>.</p>
<p>— Planasia</p>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getEmailFrom(),
        to: [email],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] slip-failed resend failed", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] slip-failed", err);
    return false;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
