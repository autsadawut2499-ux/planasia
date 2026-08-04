"use client";

import { loadStripe, type Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Browser Stripe.js singleton (Payment Element / confirmCardPayment).
 * Hosted Checkout redirect does not need this — only PaymentIntent UI does.
 */
export function getStripeJs(
  publishableKey?: string | null,
): Promise<Stripe | null> {
  const key =
    (publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "").trim();
  if (!key) return Promise.resolve(null);

  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
