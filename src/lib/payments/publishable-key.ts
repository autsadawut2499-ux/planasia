/** @deprecated Stripe publishable key removed. */
export function getStripePublishableKey(): string | null {
  return null;
}

export function isStripePublishableConfigured(): boolean {
  return false;
}

export function stripePublishableKeyMode(): "test" | "live" | null {
  return null;
}

export function requireStripePublishableKey(): never {
  throw new Error("Stripe removed — use bank transfer + slip verification");
}
