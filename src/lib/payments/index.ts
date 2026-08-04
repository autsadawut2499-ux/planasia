/**
 * Planasia payments public surface (server modules).
 *
 * Prefer importing from specific files in app routes to keep bundles lean.
 * This barrel documents the stack for contributors.
 */

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

export {
  createCartPaymentIntent,
  retrievePaymentIntent,
  isPaymentIntentPaid,
} from "@/lib/payments/payment-intent";

export { fulfillPaidCheckoutSession, isCheckoutSessionPaid } from "@/lib/payments/fulfill-checkout";
export { fulfillPaidPaymentIntent } from "@/lib/payments/fulfill-payment-intent";
