import "server-only";

import webpush from "web-push";
import { getListingById } from "@/lib/store/db";
import { getVapidConfig, isWebPushConfigured } from "@/lib/push/vapid";
import {
  deletePushSubscription,
  listPushSubscriptions,
} from "@/lib/push/subscriptions";
import { vendorNetPreview } from "@/lib/commerce/commission";

export interface SalePushItem {
  listingId: string;
  planId: string;
  name: string;
  priceThb: number;
}

/**
 * After payment clears: find each listing's draftsman and fire a Web Push
 * notification to every device they registered. Never throws — sale unlock
 * must not fail because a phone was offline.
 */
export async function notifyVendorsOfSale(items: SalePushItem[]): Promise<void> {
  if (!items.length || !isWebPushConfigured()) return;

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
      });
      byOwner.set(ownerKey, list);
    } catch (err) {
      console.error("[push] owner lookup failed", item.listingId, err);
    }
  }

  await Promise.all(
    Array.from(byOwner.entries()).map(([ownerKey, sold]) =>
      sendSalePushToOwner(ownerKey, sold).catch((err) =>
        console.error("[push] send failed", ownerKey, err),
      ),
    ),
  );
}

async function sendSalePushToOwner(ownerKey: string, items: SalePushItem[]): Promise<void> {
  const vapid = getVapidConfig();
  if (!vapid) return;

  const subs = await listPushSubscriptions(ownerKey);
  if (subs.length === 0) {
    console.info(`[push] no devices for owner ${ownerKey.slice(0, 8)}… — sale still recorded`);
    return;
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
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        // Gone / expired subscription — prune so we stop retrying.
        if (status === 404 || status === 410) {
          await deletePushSubscription(sub.endpoint, ownerKey);
        } else {
          console.error("[push] device send error", status, err);
        }
      }
    }),
  );

  console.info(
    `[push] notified ${subs.length} device(s) for ${ownerKey.slice(0, 8)}… → ${planCodes}`,
  );
}
