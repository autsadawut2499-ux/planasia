import { vendorNetPreview } from "@/lib/commerce/commission";
import { getSiteUrl } from "@/lib/seo/site-url";

export interface DesignerSaleLine {
  listingId: string;
  planId: string;
  name: string;
  priceThb: number;
}

/**
 * SMS body for post-sale designer alert (Thai) via ThaiBulkSMS.
 * Exact template required for seller notifications.
 */
export function buildDesignerSaleSms(opts: {
  items: DesignerSaleLine[];
  cartOrderId: string;
}): string {
  const codes = opts.items.map((i) => i.planId).filter(Boolean).join(", ") || "—";
  return `แจ้งเตือนการขาย: รหัสแบบบ้าน ${codes} ได้รับการสั่งซื้อเรียบร้อยแล้ว ขอบคุณที่ใช้บริการ Plan Asia`;
}

export function buildDesignerSaleEmail(opts: {
  displayName: string;
  items: DesignerSaleLine[];
  cartOrderId: string;
}): { subject: string; text: string; html: string } {
  const { displayName, items, cartOrderId } = opts;
  const totalThb = items.reduce((s, i) => s + i.priceThb, 0);
  const vendorEarn = vendorNetPreview(totalThb);
  const dashboardUrl = `${getSiteUrl()}/dashboard/draftsman`;
  const name = displayName.trim() || "นักเขียนแบบ";

  const lines = items
    .map(
      (i) =>
        `• ${i.name} (${i.planId}) — ฿${i.priceThb.toLocaleString("th-TH")}`,
    )
    .join("\n");

  const subject =
    items.length === 1
      ? `[Planasia] ขายแล้ว: ${items[0].planId}`
      : `[Planasia] ขายแล้ว ${items.length} แบบ`;

  const text = [
    `สวัสดีคุณ ${name}`,
    "",
    "มีคำสั่งซื้อชำระเงินเรียบร้อยแล้วสำหรับแบบบ้านของคุณ",
    "",
    lines,
    "",
    `ยอดขายรวม: ฿${totalThb.toLocaleString("th-TH")}`,
    `ส่วนแบ่งโดยประมาณ: ฿${vendorEarn.toLocaleString("th-TH")} (70%)`,
    `รหัสคำสั่งซื้อ: ${cartOrderId}`,
    "",
    "กรุณาเข้าสู่แดชบอร์ดเพื่อตรวจสอบรายการและเตรียมส่งมอบงาน:",
    dashboardUrl,
    "",
    "— Planasia",
  ].join("\n");

  const htmlLines = items
    .map(
      (i) =>
        `<li><strong>${escapeHtml(i.name)}</strong> (${escapeHtml(i.planId)}) — ฿${i.priceThb.toLocaleString("th-TH")}</li>`,
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:560px;color:#1e3a5f">
      <h2 style="margin:0 0 12px;color:#1e40af">ขายแล้ว — ชำระเงินเรียบร้อย</h2>
      <p>สวัสดีคุณ ${escapeHtml(name)}</p>
      <p>มีคำสั่งซื้อชำระเงินเรียบร้อยแล้วสำหรับแบบบ้านของคุณ:</p>
      <ul style="padding-left:18px">${htmlLines}</ul>
      <p>
        ยอดขายรวม: <strong>฿${totalThb.toLocaleString("th-TH")}</strong><br/>
        ส่วนแบ่งโดยประมาณ: <strong>฿${vendorEarn.toLocaleString("th-TH")}</strong> (70%)<br/>
        รหัสคำสั่งซื้อ: <code>${escapeHtml(cartOrderId)}</code>
      </p>
      <p>
        <a href="${dashboardUrl}" style="display:inline-block;background:#1e40af;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:600">
          เข้าตรวจ / เตรียมส่งมอบงาน
        </a>
      </p>
      <p style="font-size:12px;color:#64748b">— Planasia</p>
    </div>
  `;

  return { subject, text, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
