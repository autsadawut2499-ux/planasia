/**
 * Planasia payments — bank transfer + automatic slip verification.
 * Stripe has been removed.
 */

export {
  availablePaymentMethods,
  defaultPaymentMethod,
  type PaymentMethodId,
  type PaymentMethodOption,
} from "@/lib/payments/methods";

export {
  DEFAULT_PAYMENT_SETTINGS,
  normalizePaymentSettings,
  publicBankDetails,
  type PaymentSettings,
  type PaymentBankAccount,
} from "@/lib/payments/settings";

export { verifyBankSlip } from "@/lib/payments/slip-verify";
export { bankTransferCheckoutResponse } from "@/lib/payments/bank-transfer-checkout";
export { isSlipmateConfigured } from "@/lib/payments/slipmate-config";

/** @deprecated Stripe removed — stubs only */
export {
  getStripe,
  createCheckoutSession,
  createCartCheckoutSession,
  computePrice,
  isStripeConfigured,
  isStripeWebhookConfigured,
  isMockPaymentsAllowed,
  getStripeCheckoutReadiness,
  getStripeWebhookReadiness,
  getStripePaymentIntentReadiness,
  getStripeStackStatus,
  getStripePublishableKey,
  isStripePublishableConfigured,
} from "@/lib/payments/stripe";
