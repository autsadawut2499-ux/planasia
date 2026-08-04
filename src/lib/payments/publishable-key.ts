/**
 * Client-safe Stripe publishable key helpers (no server-only import).
 * Used by Payment Element / ConfirmCardPayment flows.
 */

export function getStripePublishableKey(): string | null {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
  return key || null;
}

export function isStripePublishableConfigured(): boolean {
  return Boolean(getStripePublishableKey());
}

export function stripePublishableKeyMode(): "live" | "test" | "unknown" | "missing" {
  const key = getStripePublishableKey();
  if (!key) return "missing";
  if (key.startsWith("pk_live_")) return "live";
  if (key.startsWith("pk_test_")) return "test";
  return "unknown";
}
