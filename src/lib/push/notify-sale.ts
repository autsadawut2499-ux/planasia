import "server-only";

import webpush from "web-push";
import { getListingById } from "@/lib/store/db";
import { listingSupplierName } from "@/lib/store/listing-supplier";
import { getVapidConfig, isWebPushConfigured } from "@/lib/push/vapid";
import {
  deletePushSubscription,
  listPushSubscriptions,
} from "@/lib/push/subscriptions";
import { vendorNetPreview } from "@/lib/commerce/commission";
import { getVendorForSaleNotify } from "@/lib/supabase/vendors";
import { toE164Phone } from "@/lib/sms/phone";
import { isSmsConfigured, sendSms } from "@/lib/sms/send";
import {
  buildDesignerSaleSms,
  type DesignerSaleLine,
} from "@/lib/notifications/designer-sale-message";
import {
  claimSaleNotification,
  updateSaleNotificationChannels,
  type NotifyChannelStatus,
} from "@/lib/notifications/sale-notify-log";

/** Alias kept for call sites — same shape as designer sale notification lines. */
export type SalePushItem = DesignerSaleLine;

/**
 * After payment clears (Paid / Success):
 *  1. Map each listing → designer (store_listings.owner_id → vendor_profiles)
 *  2. Web Push to registered devices
 *  3. SMS to contact_phone (ThaiBulkSMS preferred, Twilio fallback)
 *
 * Email is disabled — post-payment alerts are SMS + LINE only.
 *
 * Never throws — sale unlock must not fail because a phone was offline.
 */
export async function notifyVendorsOfSale(
  items: SalePushItem[],
  opts?: { cartOrderId?: string },
): Promise<void> {
  if (!items.length) return;

  const cartOrderId = opts?.cartOrderId?.trim() || `sale_${Date.now()}`;
  const byOwner = new Map<string, SalePushItem[]>();

  for (const item of items) {
    try {
      const listing = await getListingById(item.listingId);
      const ownerKey = listing?.ownerId?.trim();
      if (!ownerKey || ownerKey === "seed-demo") continue;
      const list = byOwner.get(ownerKey) ?? [];
      list.push({
        ...item,
        planId: listing?.planId || item.planId,
        name: listing?.name || item.name,
        priceThb: item.priceThb || listing?.price || 0,
        supplierName: listingSupplierName(listing) || item.supplierName,
      });
      byOwner.set(ownerKey, list);
    } catch (err) {
      console.error("[sale-notify] owner lookup failed", item.listingId, err);
    }
  }

  await Promise.all(
    Array.from(byOwner.entries()).map(([ownerKey, sold]) =>
      notifyOwnerOfSale(ownerKey, sold, cartOrderId).catch((err) =>
        console.error("[sale-notify] owner notify failed", ownerKey, err),
      ),
    ),
  );
}

async function notifyOwnerOfSale(
  ownerKey: string,
  items: SalePushItem[],
  cartOrderId: string,
): Promise<void> {
  const vendor = await getVendorForSaleNotify(ownerKey).catch(() => null);
  const phoneE164 = toE164Phone(vendor?.contactPhone);

  const claim = await claimSaleNotification({
    cartOrderId,
    ownerKey,
    listingIds: items.map((i) => i.listingId),
    planCodes: items.map((i) => i.planId),
    phoneE164,
  });
  if (!claim) {
    console.info(
      `[sale-notify] already notified ${ownerKey.slice(0, 8)}… for order ${cartOrderId}`,
    );
    return;
  }

  const [pushStatus, smsOutcome] = await Promise.all([
    sendSalePushToOwner(ownerKey, items),
    sendSaleSmsToOwner(phoneE164, items, cartOrderId),
  ]);

  await updateSaleNotificationChannels(claim.id, {
    phoneE164,
    pushStatus,
    smsStatus: smsOutcome.status,
    smsError: smsOutcome.error ?? null,
    smsMessageId: smsOutcome.messageId ?? null,
    smsProvider: smsOutcome.provider ?? null,
    emailStatus: "skipped",
  });
}

async function sendSaleSmsToOwner(
  phoneE164: string | null,
  items: SalePushItem[],
  cartOrderId: string,
): Promise<{
  status: NotifyChannelStatus;
  error?: string;
  messageId?: string;
  provider?: string;
}> {
  if (!phoneE164) {
    console.info("[sms] skipped — designer has no contact_phone on vendor_profiles");
    return { status: "skipped", error: "no_phone" };
  }
  if (!isSmsConfigured()) {
    return { status: "skipped", error: "sms_not_configured" };
  }

  const body = buildDesignerSaleSms({ items, cartOrderId });
  const result = await sendSms(phoneE164, body);
  if (result.skipped) {
    return { status: "skipped", error: result.error, provider: result.provider };
  }
  if (!result.ok) {
    return { status: "failed", error: result.error, provider: result.provider };
  }
  return {
    status: "sent",
    messageId: result.messageId,
    provider: result.provider,
  };
}

async function sendSalePushToOwner(
  ownerKey: string,
  items: SalePushItem[],
): Promise<NotifyChannelStatus> {
  if (!isWebPushConfigured()) return "skipped";

  const vapid = getVapidConfig();
  if (!vapid) return "skipped";

  const subs = await listPushSubscriptions(ownerKey);
  if (subs.length === 0) {
    console.info(`[push] no devices for owner ${ownerKey.slice(0, 8)}… — sale still recorded`);
    return "skipped";
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  const totalThb = items.reduce((s, i) => s + i.priceThb, 0);
  const vendorEarn = vendorNetPreview(totalThb);
  const planCodes = items.map((i) => i.planId).join(", ");
  const title =
    items.length === 1 ? `ขายแล้ว! ${items[0].planId}` : `ขายแล้ว ${items.length} แบบ`;
  const body =
    items.length === 1
      ? `${items[0].name} · คุณได้รับ ฿${vendorEarn.toLocaleString("th-TH")} (70%)`
      : `รหัส ${planCodes} · รวม ฿${vendorEarn.toLocaleString("th-TH")} (ส่วนแบ่ง 70%)`;

  const payload = JSON.stringify({
    title,
    body,
    url: "/dashboard/draftsman",
    planIds: items.map((i) => i.planId),
    tag: `sale-${items.map((i) => i.planId).join("-")}`.slice(0, 64),
  });

  let sent = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload,
          { urgency: "high", TTL: 60 * 60 * 24 },
        );
        sent += 1;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await deletePushSubscription(sub.endpoint, ownerKey);
        } else {
          console.error("[push] device send error", status, err);
        }
      }
    }),
  );

  console.info(
    `[push] notified ${sent}/${subs.length} device(s) for ${ownerKey.slice(0, 8)}… → ${planCodes}`,
  );
  return sent > 0 ? "sent" : "failed";
}
