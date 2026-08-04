import { NextRequest, NextResponse } from "next/server";
import {
  resolveDeliveryFileKind,
  standardizedDeliveryFilename,
  standardizedDownloadButtonLabel,
} from "@/lib/payments/download-filenames";
import { buildBuyerDownloadLinks } from "@/lib/payments/translated-download-links";
import { fulfillPaidPaymentIntent } from "@/lib/payments/fulfill-payment-intent";
import {
  getStripePaymentIntentReadiness,
  isStripeConfigured,
} from "@/lib/payments/config";
import {
  isPaymentIntentPaid,
  retrievePaymentIntent,
} from "@/lib/payments/payment-intent";
import { findGrantsByStripeSession } from "@/lib/payments/tokens";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * GET|POST /api/payments/intent/confirm?payment_intent_id=
 * Browser/client backup after Stripe.js confirms a PaymentIntent.
 */
async function confirmIntent(paymentIntentId: string) {
  if (!paymentIntentId) {
    return NextResponse.json(
      { error: "payment_intent_id required" },
      { status: 400 },
    );
  }

  if (!isStripeConfigured()) {
    const readiness = getStripePaymentIntentReadiness();
    return NextResponse.json(
      {
        error: readiness.ok ? "Stripe not configured" : readiness.error,
        missing: readiness.ok ? ["STRIPE_SECRET_KEY"] : readiness.missing,
      },
      { status: 503 },
    );
  }

  const intent = await retrievePaymentIntent(paymentIntentId);
  if (!intent) {
    return NextResponse.json({ error: "PaymentIntent not found" }, { status: 404 });
  }

  if (!isPaymentIntentPaid(intent)) {
    return NextResponse.json({
      success: false,
      status: intent.status,
      pending: intent.status === "processing" || intent.status === "requires_action",
      message: `PaymentIntent status: ${intent.status}`,
    });
  }

  // Already fulfilled via webhook?
  const existing = await findGrantsByStripeSession(intent.id);
  if (existing.length > 0 && intent.metadata?.cartOrderId) {
    return NextResponse.json({
      success: true,
      cart: true,
      orderId: intent.metadata.cartOrderId,
      planIds: existing.map((g) => g.planId),
      downloads: existing.map((g) => ({
        token: g.token,
        planId: g.planId,
        format: g.format,
      })),
      source: "existing_grants",
    });
  }

  try {
    const result = await fulfillPaidPaymentIntent(intent);
    if (result.kind === "ignored") {
      return NextResponse.json({
        success: false,
        pending: true,
        reason: result.reason,
        planIds: result.planIds,
      });
    }

    if (result.kind === "cart") {
      const docLang = result.order.documentLanguage ?? "th";
      const downloads = buildBuyerDownloadLinks({
        order: result.order,
        grants: result.grants,
        translation: result.translation,
      });
      return NextResponse.json({
        success: true,
        cart: true,
        orderId: result.cartOrderId,
        planIds: result.planIds,
        buyerEmail: result.order.buyerEmail ?? null,
        documentLanguage: docLang,
        emailSent: Boolean(result.emailSent),
        downloads,
      });
    }

    return NextResponse.json({
      success: true,
      planIds: result.planIds,
      downloads: result.grants.map((g) => {
        const fileKind = resolveDeliveryFileKind({
          fileKind: g.fileKind,
          format: g.format,
        });
        const fileIndex =
          typeof g.fileIndex === "number" && g.fileIndex >= 0 ? g.fileIndex : 0;
        return {
          token: g.token,
          planId: g.planId,
          format: g.format,
          fileKind,
          filename: standardizedDeliveryFilename(g.planId, fileKind, fileIndex),
          label: standardizedDownloadButtonLabel(g.planId, fileKind, fileIndex),
          downloadUrl: `/api/download?token=${g.token}&format=${g.format}`,
        };
      }),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fulfillment failed";
    console.error("[payment-intent-confirm] fulfillment error", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const id =
    request.nextUrl.searchParams.get("payment_intent_id") ||
    request.nextUrl.searchParams.get("payment_intent") ||
    "";
  return confirmIntent(id.trim());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const id = String(
    body.payment_intent_id ?? body.paymentIntentId ?? body.payment_intent ?? "",
  ).trim();
  return confirmIntent(id);
}
