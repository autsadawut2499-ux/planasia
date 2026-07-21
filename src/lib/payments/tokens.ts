import { randomBytes } from "crypto";
import { readJsonBlob, writeJsonBlob } from "@/lib/storage/runtime";

export interface DownloadGrant {
  token: string;
  planId: string;
  format: "pdf" | "cad";
  userId?: string;
  stripeSessionId?: string;
  createdAt: string;
  expiresAt: string;
}

const TOKENS_FILE = "download-tokens.json";

async function loadTokens(): Promise<DownloadGrant[]> {
  return readJsonBlob<DownloadGrant[]>(TOKENS_FILE, []);
}

async function saveTokens(tokens: DownloadGrant[]): Promise<void> {
  await writeJsonBlob(TOKENS_FILE, tokens);
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
  const tokens = await loadTokens();
  tokens.push(grant);
  await saveTokens(tokens);
}

export async function findValidGrant(token: string): Promise<DownloadGrant | null> {
  const tokens = await loadTokens();
  const grant = tokens.find((t) => t.token === token);
  if (!grant) return null;
  if (new Date(grant.expiresAt) < new Date()) return null;
  return grant;
}

export async function findGrantByStripeSession(sessionId: string): Promise<DownloadGrant | null> {
  const tokens = await loadTokens();
  return tokens.find((t) => t.stripeSessionId === sessionId) ?? null;
}

export async function findGrantsByStripeSession(sessionId: string): Promise<DownloadGrant[]> {
  const tokens = await loadTokens();
  return tokens.filter((t) => t.stripeSessionId === sessionId);
}

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
