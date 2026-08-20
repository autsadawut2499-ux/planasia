/**
 * Payment stack config — bank transfer + slip verification (Stripe removed).
 */

export function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

export function isMockPaymentsAllowed(): boolean {
  if (isProductionRuntime()) return false;
  return process.env.ALLOW_MOCK_PAYMENTS === "true";
}

/** @deprecated Stripe removed */
export function isStripeSecretConfigured(): boolean {
  return false;
}

/** @deprecated Stripe removed */
export function isStripeWebhookSecretConfigured(): boolean {
  return false;
}

/** @deprecated Stripe removed */
export function isStripeConfigured(): boolean {
  return false;
}

/** @deprecated Stripe removed */
export function isStripeWebhookConfigured(): boolean {
  return false;
}

/** @deprecated Stripe removed */
export function getStripePublishableKey(): string | null {
  return null;
}

/** @deprecated Stripe removed */
export function isStripePublishableConfigured(): boolean {
  return false;
}

/** @deprecated Stripe removed */
export function stripePublishableKeyMode(): "test" | "live" | null {
  return null;
}

export type StripeCheckoutReadiness =
  | { ok: true }
  | { ok: false; missing: string[]; error: string };

const REMOVED: StripeCheckoutReadiness = {
  ok: false,
  missing: [],
  error:
    "Stripe ถูกถอดออกแล้ว — ใช้โอนธนาคาร + ตรวจสลิปอัตโนมัติ (แอดมิน → การตั้งค่าการชำระเงิน)",
};

export function getStripeCheckoutReadiness(): StripeCheckoutReadiness {
  return REMOVED;
}

export function getStripeWebhookReadiness(): StripeCheckoutReadiness {
  return REMOVED;
}

export function getStripePaymentIntentReadiness(): StripeCheckoutReadiness {
  return REMOVED;
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
