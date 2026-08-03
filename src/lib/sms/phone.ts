/**
 * Normalize Thai / international phone numbers to E.164 for SMS gateways.
 * Accepts: 08x-xxx-xxxx, 08xxxxxxxx, +668xxxxxxxx, 668xxxxxxxx
 */
export function toE164Phone(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  let digits = raw.trim().replace(/[^\d+]/g, "");

  if (digits.startsWith("+")) {
    digits = `+${digits.slice(1).replace(/\D/g, "")}`;
  } else {
    digits = digits.replace(/\D/g, "");
  }

  if (digits.startsWith("+66")) {
    const rest = digits.slice(3);
    if (rest.length === 9 && /^[1-9]/.test(rest)) return `+66${rest}`;
    return null;
  }

  if (digits.startsWith("66") && digits.length === 11) {
    const rest = digits.slice(2);
    if (/^[1-9]\d{8}$/.test(rest)) return `+66${rest}`;
    return null;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    const rest = digits.slice(1);
    if (/^[1-9]\d{8}$/.test(rest)) return `+66${rest}`;
    return null;
  }

  // Already international without + (e.g. US) — require leading country code length
  if (!digits.startsWith("+") && digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }

  if (digits.startsWith("+") && digits.length >= 11 && digits.length <= 16) {
    return digits;
  }

  return null;
}
