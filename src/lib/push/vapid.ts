import "server-only";

/** VAPID keys for Web Push. Generate with: npx web-push generate-vapid-keys */
export function getVapidConfig(): {
  publicKey: string;
  privateKey: string;
  subject: string;
} | null {
  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() ||
    process.env.VAPID_PUBLIC_KEY?.trim() ||
    "";
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() || "";
  if (!publicKey || !privateKey) return null;

  const subject =
    process.env.VAPID_SUBJECT?.trim() ||
    (process.env.NEXTAUTH_URL ? `mailto:hello@${new URL(process.env.NEXTAUTH_URL).hostname}` : "mailto:hello@planasia.com");

  return { publicKey, privateKey, subject };
}

export function isWebPushConfigured(): boolean {
  return getVapidConfig() != null;
}
