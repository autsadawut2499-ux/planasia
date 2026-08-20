import "server-only";
import { timingSafeEqual } from "crypto";

/**
 * Admin dashboard PIN gate.
 * Override with ADMIN_PIN (exactly 6 digits) when needed; otherwise 501499.
 */
export const DEFAULT_ADMIN_PIN = "501499";

export function getAdminPin(): string {
  const fromEnv = process.env.ADMIN_PIN?.trim();
  if (fromEnv && /^\d{6}$/.test(fromEnv)) return fromEnv;
  return DEFAULT_ADMIN_PIN;
}

/** Whether a usable 6-digit ADMIN_PIN is available. */
export function isAdminPinConfigured(): boolean {
  return /^\d{6}$/.test(getAdminPin());
}

/** Constant-time compare for 6-digit PIN strings. */
export function verifyAdminPin(input: string): boolean {
  const expected = getAdminPin();
  const pin = String(input ?? "").trim();
  if (!/^\d{6}$/.test(pin) || !/^\d{6}$/.test(expected)) return false;

  const a = Buffer.from(pin);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
