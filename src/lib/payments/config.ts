import "server-only";

/**
 * Stripe / mock-payment configuration helpers.
 *
 * Production always requires real Stripe keys.
 * Local mock unlocks are opt-in via ALLOW_MOCK_PAYMENTS=true (never in production).
 */

export function isStripeSecretConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function isStripeWebhookSecretConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}

/** Secret key present — enough to create Checkout sessions. */
export function isStripeConfigured(): boolean {
  return isStripeSecretConfigured();
}

/**
 * Both secret key and webhook signing secret are set.
 * Required for reliable PromptPay / async fulfillment in production.
 */
export function isStripeWebhookConfigured(): boolean {
  return isStripeSecretConfigured() && isStripeWebhookSecretConfigured();
}

export function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

/**
 * Dev-only free unlock path. Permanently disabled in production /
 * Vercel production — even if ALLOW_MOCK_PAYMENTS is mistakenly set.
 */
export function isMockPaymentsAllowed(): boolean {
  if (isProductionRuntime()) return false;
  if (process.env.ALLOW_MOCK_PAYMENTS === "true") {
    console.warn(
      "[payments] ALLOW_MOCK_PAYMENTS is enabled — never deploy this to production",
    );
    return true;
  }
  return false;
}

export type StripeCheckoutReadiness =
  | { ok: true }
  | { ok: false; status: 503; error: string; missing: string[] };

/** Validate env before creating a Checkout session. */
export function getStripeCheckoutReadiness(): StripeCheckoutReadiness {
  const missing: string[] = [];
  if (!isStripeSecretConfigured()) missing.push("STRIPE_SECRET_KEY");

  if (missing.length === 0) return { ok: true };

  if (isProductionRuntime()) {
    return {
      ok: false,
      status: 503,
      missing,
      error:
        "Stripe is not configured. Set STRIPE_SECRET_KEY (and STRIPE_WEBHOOK_SECRET for webhooks) before accepting payments.",
    };
  }

  if (isMockPaymentsAllowed()) {
    // Caller may fall through to mock path.
    return {
      ok: false,
      status: 503,
      missing,
      error:
        "Stripe is not configured. Mock payments are enabled (ALLOW_MOCK_PAYMENTS=true).",
    };
  }

  return {
    ok: false,
    status: 503,
    missing,
    error:
      "Stripe is not configured. Set STRIPE_SECRET_KEY, or set ALLOW_MOCK_PAYMENTS=true for local mock unlocks (development only).",
  };
}

export type StripeWebhookReadiness =
  | { ok: true }
  | { ok: false; status: 503; error: string; missing: string[] };

export function getStripeWebhookReadiness(): StripeWebhookReadiness {
  const missing: string[] = [];
  if (!isStripeSecretConfigured()) missing.push("STRIPE_SECRET_KEY");
  if (!isStripeWebhookSecretConfigured()) missing.push("STRIPE_WEBHOOK_SECRET");

  if (missing.length === 0) return { ok: true };

  return {
    ok: false,
    status: 503,
    missing,
    error: `Stripe webhook not configured. Missing: ${missing.join(", ")}. Local test: stripe listen --forward-to localhost:3000/api/webhooks/stripe`,
  };
}
