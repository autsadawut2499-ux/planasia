import "server-only";

import {
  buildDesignerSaleEmail,
  type DesignerSaleLine,
} from "@/lib/notifications/designer-sale-message";

/** Lightweight Resend email to the designer after a paid sale. */
export async function sendDesignerSaleEmail(opts: {
  to: string;
  displayName: string;
  items: DesignerSaleLine[];
  cartOrderId: string;
}): Promise<boolean> {
  const email = opts.to.trim();
  if (!email) return false;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Planasia <noreply@planasia.com>";
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email] designer sale skipped — RESEND_API_KEY missing", {
        to: email,
        orderId: opts.cartOrderId,
      });
    }
    return false;
  }

  const { subject, text, html } = buildDesignerSaleEmail({
    displayName: opts.displayName,
    items: opts.items,
    cartOrderId: opts.cartOrderId,
  });

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [email], subject, text, html }),
    });
    if (!res.ok) {
      console.error("[email] designer sale resend failed", await res.text());
      return false;
    }
    console.info("[email] designer sale sent", { to: email, orderId: opts.cartOrderId });
    return true;
  } catch (err) {
    console.error("[email] designer sale send failed", err);
    return false;
  }
}
