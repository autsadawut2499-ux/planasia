/**
 * Stripe has been removed from Planasia.
 * Payments use bank transfer + automatic slip verification.
 * This module remains only so legacy imports compile; all functions are no-ops.
 */

import type { Currency } from "@/lib/currency";
import type { PaymentMethodId } from "@/lib/payments/methods";

export function isStripeConfigured(): boolean {
  return false;
}

export function isStripeWebhookConfigured(): boolean {
  return false;
}

export function isMockPaymentsAllowed(): boolean {
  return process.env.ALLOW_MOCK_PAYMENTS === "true";
}

export function getStripe(): null {
  return null;
}

export function getStripePublishableKey(): string | null {
  return null;
}

export function isStripePublishableConfigured(): boolean {
  return false;
}

export type StripeCheckoutReadiness =
  | { ok: true }
  | { ok: false; missing: string[]; error: string };

export function getStripeCheckoutReadiness(): StripeCheckoutReadiness {
  return {
    ok: false,
    missing: [],
    error:
      "Stripe ถูกถอดออกแล้ว — ใช้โอนธนาคาร + ตรวจสลิปอัตโนมัติ (แอดมิน → การตั้งค่าการชำระเงิน)",
  };
}

export function getStripeWebhookReadiness(): StripeCheckoutReadiness {
  return getStripeCheckoutReadiness();
}

export function getStripePaymentIntentReadiness(): StripeCheckoutReadiness {
  return getStripeCheckoutReadiness();
}

export function getStripeStackStatus() {
  return {
    stripeSecretConfigured: false,
    stripePublishableConfigured: false,
    webhookSecretConfigured: false,
    mockPaymentsAllowed: isMockPaymentsAllowed(),
    checkoutReady: false,
    paymentIntentReady: false,
    webhookReady: false,
    message: "Bank transfer + slip verification only",
    webhook: null as string | null,
  };
}

export async function createCheckoutSession(_params: {
  planId: string;
  format: "pdf" | "cad";
  method: PaymentMethodId | string;
  currency?: Currency;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ url: string | null; sessionId: string | null; error?: string }> {
  return {
    url: null,
    sessionId: null,
    error: "Stripe removed — use bank transfer checkout",
  };
}

export async function createCartCheckoutSession(_params: {
  cartOrderId: string;
  method: PaymentMethodId | string;
  currency?: Currency;
  successUrl: string;
  cancelUrl: string;
  lineItems: unknown[];
}): Promise<{ url: string | null; sessionId: string | null; error?: string }> {
  return {
    url: null,
    sessionId: null,
    error: "Stripe removed — use bank transfer checkout",
  };
}

export function computePrice(amountThb: number): number {
  return Math.max(0, Math.round(amountThb));
}
