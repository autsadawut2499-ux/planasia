import { NextRequest, NextResponse } from "next/server";
import {
  resolveDeliveryFileKind,
  standardizedDeliveryFilename,
  standardizedDownloadButtonLabel,
} from "@/lib/payments/download-filenames";
import { findGrantsByStripeSession } from "@/lib/payments/tokens";
import {
  getStripe,
  getStripeCheckoutReadiness,
  isStripeConfigured,
} from "@/lib/payments/stripe";
import {
  fulfillPaidCheckoutSession,
  isCheckoutSessionPaid,
} from "@/lib/payments/fulfill-checkout";
import { buildBuyerDownloadLinks } from "@/lib/payments/translated-download-links";

/**
 * Browser return-URL backup for the webhook.
 * If the buyer lands back on /store?session_id=… before (or without) the
 * webhook, we fulfill from here using the same idempotent helpers.
 *
 * Always retrieves the session from Stripe — never trusts client-claimed paid status.
 * Post-payment OCR → Translation → email runs inside cart fulfillment.
 */
export const runtime = "nodejs";
/** Translation + OCR can exceed the default serverless limit. */
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  if (!isStripeConfigured()) {
    const existingGrants = await findGrantsByStripeSession(sessionId);
    if (existingGrants.length > 0) {
      if (existingGrants.length === 1) {
        const g = existingGrants[0];
        return NextResponse.json({
          success: true,
          downloadToken: g.token,
          format: g.format,
          planId: g.planId,
        });
      }
      return NextResponse.json({
        success: true,
        cart: true,
        downloads: existingGrants.map((g) => ({
          token: g.token,
          planId: g.planId,
          format: g.format,
        })),
      });
    }

    const readiness = getStripeCheckoutReadiness();
    return NextResponse.json(
      {
        error: readiness.ok
          ? "Stripe not configured"
          : readiness.error,
        missing: readiness.ok ? ["STRIPE_SECRET_KEY"] : readiness.missing,
      },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured", missing: ["STRIPE_SECRET_KEY"] },
      { status: 503 },
    );
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Session retrieve failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!isCheckoutSessionPaid(session)) {
    return NextResponse.json({
      success: false,
      status: session.payment_status,
      pending: session.payment_status === "unpaid",
      message:
        session.payment_status === "unpaid"
          ? "Payment still pending (e.g. PromptPay QR). Wait for confirmation or refresh shortly."
          : `Payment status: ${session.payment_status}`,
    });
  }

  try {
    // Idempotent: issues grants if needed, then runs Gemini translate + units for cart orders.
    const result = await fulfillPaidCheckoutSession(session);

    if (result.kind === "ignored") {
      return NextResponse.json({
        success: false,
        pending: true,
        message: "Payment received but order metadata missing",
        reason: result.reason,
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
        docLang,
        documentLanguage: docLang,
        targetCountry: result.order.targetCountry ?? result.translation?.target_country ?? "TH",
        emailSent: Boolean(result.emailSent),
        downloads,
        translation: result.translation
          ? {
              status: result.translation.status,
              target_country: result.translation.target_country,
              target_language: result.translation.target_language,
              target_language_code: result.translation.target_language_code,
              engine: result.translation.engine,
              blueprintCount: result.translation.blueprints?.length ?? 0,
              modes: (result.translation.blueprints ?? [])
                .map((b) => b.mode)
                .filter(Boolean),
            }
          : undefined,
      });
    }

    const grant = result.grants[0];
    return NextResponse.json({
      success: true,
      downloadToken: grant?.token,
      format: grant?.format,
      planId: grant?.planId,
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
    console.error("[payment-confirm] fulfillment error", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
