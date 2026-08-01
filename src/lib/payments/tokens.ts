import { randomBytes } from "crypto";
import {
  findGrantByStripeSession,
  findGrantsByStripeSession,
  findValidGrant as supabaseFindValidGrant,
  storeDownloadGrant as supabaseStoreDownloadGrant,
} from "@/lib/supabase/download-grants";
import { getListingBlueprintUrls } from "@/lib/store/listing-blueprints";

export interface DownloadGrant {
  token: string;
  /** Marketplace plan code (or legacy document UUID for old grants). */
  planId: string;
  /** store_listings.id — preferred for vendor blueprint delivery. */
  listingId?: string;
  /** Index into the listing's blueprint_pdf_urls array. */
  fileIndex?: number;
  /** @deprecated Legacy house_plans id — unused for vendor blueprint delivery. */
  planDocumentId?: string;
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
  planDocumentId?: string,
  listingId?: string,
  fileIndex?: number,
): DownloadGrant {
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    token: randomBytes(24).toString("hex"),
    planId,
    listingId,
    fileIndex: fileIndex ?? 0,
    planDocumentId,
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

/**
 * Issue download grants for paid cart items.
 * One grant per vendor-uploaded blueprint PDF (primary marketplace path).
 */
export async function fulfillCartDownloads(
  items: { planId: string; planDocumentId?: string; listingId?: string }[],
  includeCad: boolean,
  userId?: string,
  stripeSessionId?: string,
): Promise<DownloadGrant[]> {
  const grants: DownloadGrant[] = [];

  for (const item of items) {
    const blueprintUrls = item.listingId
      ? await getListingBlueprintUrls(item.listingId)
      : [];

    if (blueprintUrls.length > 0) {
      for (let i = 0; i < blueprintUrls.length; i++) {
        const pdf = createDownloadToken(
          item.planId,
          "pdf",
          userId,
          stripeSessionId,
          undefined,
          item.listingId,
          i,
        );
        await storeDownloadGrant(pdf);
        grants.push(pdf);
      }
      // Vendor marketplace sells uploaded PDFs — no generative CAD unlock.
      continue;
    }

    // Legacy generative plans (no vendor blueprints): keep PDF grant for old docs.
    if (item.planDocumentId) {
      const pdf = createDownloadToken(
        item.planId,
        "pdf",
        userId,
        stripeSessionId,
        item.planDocumentId,
        item.listingId,
        0,
      );
      await storeDownloadGrant(pdf);
      grants.push(pdf);
      if (includeCad) {
        const cad = createDownloadToken(
          item.planId,
          "cad",
          userId,
          stripeSessionId,
          item.planDocumentId,
          item.listingId,
          0,
        );
        await storeDownloadGrant(cad);
        grants.push(cad);
      }
      continue;
    }

    console.error(
      `[fulfill-downloads] No vendor blueprints or plan document for ${item.planId} (listing ${item.listingId ?? "n/a"})`,
    );
  }

  return grants;
}
