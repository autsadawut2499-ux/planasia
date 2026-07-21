import { randomBytes } from "crypto";
import {
  findGrantByStripeSession,
  findGrantsByStripeSession,
  findValidGrant as supabaseFindValidGrant,
  storeDownloadGrant as supabaseStoreDownloadGrant,
} from "@/lib/supabase/download-grants";

export interface DownloadGrant {
  token: string;
  planId: string;
  format: "pdf" | "cad";
  userId?: string;
  stripeSessionId?: string;
  createdAt: string;
  expiresAt: string;
}

export function createDownloadToken(
  planId: string,
  format: "pdf" | "cad",
  userId?: string,
  stripeSessionId?: string,
): DownloadGrant {
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    token: randomBytes(24).toString("hex"),
    planId,
    format,
    userId,
    stripeSessionId,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  };
}

export async function storeDownloadGrant(grant: DownloadGrant): Promise<void> {
  await supabaseStoreDownloadGrant(grant);
}

export async function findValidGrant(token: string): Promise<DownloadGrant | null> {
  return supabaseFindValidGrant(token);
}

export { findGrantByStripeSession, findGrantsByStripeSession };

export async function fulfillCartDownloads(
  items: { planId: string }[],
  includeCad: boolean,
  userId?: string,
  stripeSessionId?: string,
): Promise<DownloadGrant[]> {
  const grants: DownloadGrant[] = [];
  for (const item of items) {
    const pdf = createDownloadToken(item.planId, "pdf", userId, stripeSessionId);
    await storeDownloadGrant(pdf);
    grants.push(pdf);
    if (includeCad) {
      const cad = createDownloadToken(item.planId, "cad", userId, stripeSessionId);
      await storeDownloadGrant(cad);
      grants.push(cad);
    }
  }
  return grants;
}
