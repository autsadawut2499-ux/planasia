/**
 * @deprecated Stripe removed. Kept so accidental imports do not crash the build.
 */
export async function fulfillPaidCheckoutSession(): Promise<null> {
  return null;
}

export function isCheckoutSessionPaid(): boolean {
  return false;
}
