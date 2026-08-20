import "server-only";

/**
 * SlipMate Open API — server-only config from environment variables.
 * Docs: https://developers.slipmate.ai/
 * Never expose these values to the client or Admin UI.
 */

export const SLIPMATE_API_BASE_URL = (
  process.env.SLIPMATE_API_BASE_URL?.trim() ||
  "https://api.slipmate.ai/open-api"
).replace(/\/$/, "");

/** Prefer SLIPMATE_API_KEY; SLIP_VERIFY_API_KEY kept as legacy alias. */
export function getSlipmateApiKey(): string {
  return (
    process.env.SLIPMATE_API_KEY?.trim() ||
    process.env.SLIP_VERIFY_API_KEY?.trim() ||
    ""
  );
}

export function isSlipmateConfigured(): boolean {
  return Boolean(getSlipmateApiKey());
}

/** Reject duplicate slips by default (SlipMate `allowDuplicate: false`). */
export function slipmateAllowDuplicate(): boolean {
  return process.env.SLIPMATE_ALLOW_DUPLICATE === "true";
}

/** When true (default), slip amount must match order total (THB). */
export function slipmateMatchAmount(): boolean {
  return process.env.SLIPMATE_MATCH_AMOUNT !== "false";
}
