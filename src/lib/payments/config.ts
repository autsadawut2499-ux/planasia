/**
 * Shared runtime helpers for payment-adjacent server code.
 * Payments themselves are bank transfer + SlipMate (see slip-verify / bank-transfer-checkout).
 */

export function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}
