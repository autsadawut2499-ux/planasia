import "server-only";

/** Official verified sending domain on Resend. */
export const EMAIL_DOMAIN = "planasia.net";

/** Default transactional From — override with EMAIL_FROM in env. */
export const DEFAULT_EMAIL_FROM = `Planasia <noreply@${EMAIL_DOMAIN}>`;

/** Support address shown in receipt footers. */
export const SUPPORT_EMAIL = `hello@${EMAIL_DOMAIN}`;

/** Resend From header used by all transactional mail. */
export function getEmailFrom(): string {
  const configured = process.env.EMAIL_FROM?.trim();
  return configured || DEFAULT_EMAIL_FROM;
}

export function getResendApiKey(): string | undefined {
  const key = process.env.RESEND_API_KEY?.trim();
  return key || undefined;
}
