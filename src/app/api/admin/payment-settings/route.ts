import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import {
  isValidLineUserId,
  looksLikeLineChatUrl,
} from "@/lib/line/push-text";
import { normalizePaymentSettings } from "@/lib/payments/settings";
import { normalizeOrderNotifySettings } from "@/lib/payments/order-notify-settings";
import { isSlipmateConfigured } from "@/lib/payments/slipmate-config";
import { isSmsConfigured } from "@/lib/sms/send";
import {
  loadPaymentSettings,
  savePaymentSettings,
} from "@/lib/supabase/payment-settings";
import {
  loadOrderNotifySettings,
  resolveOrderNotifyLineToken,
  saveOrderNotifySettings,
} from "@/lib/supabase/order-notify-settings";
import { listLineUserSightings } from "@/lib/line/sightings";
import { getLineChannelSecret } from "@/lib/line/webhook";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();
    const [settings, orderNotify, lineSightings] = await Promise.all([
      loadPaymentSettings(),
      loadOrderNotifySettings(),
      listLineUserSightings(),
    ]);
    const lineToken = await resolveOrderNotifyLineToken(orderNotify);
    return NextResponse.json({
      settings: {
        bank: settings.bank,
        slipmateConfigured: isSlipmateConfigured(),
        smsConfigured: isSmsConfigured(),
        lineWebhook: {
          url: "https://planasia.net/api/webhooks/line",
          secretConfigured: Boolean(getLineChannelSecret()),
        },
        orderNotify: {
          notifyBuyerSms: orderNotify.notifyBuyerSms,
          notifyAdminLine: orderNotify.notifyAdminLine,
          adminLineUserId: orderNotify.adminLineUserId,
          // Never return the raw token — only whether one is available.
          hasLineToken: Boolean(lineToken),
          lineTokenSource: orderNotify.lineChannelAccessToken.trim()
            ? "order_settings"
            : lineToken
              ? "loan_or_env"
              : "none",
          adminLineUserIdValid: isValidLineUserId(orderNotify.adminLineUserId),
          adminLineUserIdLooksLikeUrl: looksLikeLineChatUrl(
            orderNotify.adminLineUserId,
          ),
          recentLineUserIds: lineSightings.slice(0, 10),
        },
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdminSession();
    const body = (await request.json()) as Record<string, unknown>;
    const incoming = normalizePaymentSettings(body.settings ?? body);
    const saved = await savePaymentSettings(incoming, admin.email);

    let orderNotify = await loadOrderNotifySettings();
    const notifyRaw =
      (body.orderNotify as Record<string, unknown> | undefined) ??
      ((body.settings as Record<string, unknown> | undefined)?.orderNotify as
        | Record<string, unknown>
        | undefined);
    if (notifyRaw && typeof notifyRaw === "object") {
      orderNotify = await saveOrderNotifySettings(
        normalizeOrderNotifySettings({
          ...orderNotify,
          ...notifyRaw,
          // Keep existing token unless a new non-empty value is posted.
          lineChannelAccessToken:
            typeof notifyRaw.lineChannelAccessToken === "string" &&
            notifyRaw.lineChannelAccessToken.trim()
              ? notifyRaw.lineChannelAccessToken
              : orderNotify.lineChannelAccessToken,
        }),
        admin.email,
      );
    }

    const lineToken = await resolveOrderNotifyLineToken(orderNotify);
    return NextResponse.json({
      settings: {
        bank: saved.bank,
        slipmateConfigured: isSlipmateConfigured(),
        smsConfigured: isSmsConfigured(),
        orderNotify: {
          notifyBuyerSms: orderNotify.notifyBuyerSms,
          notifyAdminLine: orderNotify.notifyAdminLine,
          adminLineUserId: orderNotify.adminLineUserId,
          hasLineToken: Boolean(lineToken),
          lineTokenSource: orderNotify.lineChannelAccessToken.trim()
            ? "order_settings"
            : lineToken
              ? "loan_or_env"
              : "none",
          adminLineUserIdValid: isValidLineUserId(orderNotify.adminLineUserId),
          adminLineUserIdLooksLikeUrl: looksLikeLineChatUrl(
            orderNotify.adminLineUserId,
          ),
        },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    if (message.includes("Unauthorized")) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
