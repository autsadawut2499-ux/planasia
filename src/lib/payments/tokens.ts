import { randomBytes } from "crypto";
import {
  findGrantByStripeSession,
  findGrantsByStripeSession,
  findValidGrant as supabaseFindValidGrant,
  storeDownloadGrant as supabaseStoreDownloadGrant,
} from "@/lib/supabase/download-grants";
import {
  getListingAssetUrls,
  type ListingFileKind,
} from "@/lib/store/listing-assets";
import type { UpsellAddonId } from "@/lib/store/cart-pricing";

export type DownloadFileKind = ListingFileKind;

export interface DownloadGrant {
  token: string;
  /** Marketplace plan code (or legacy document UUID for old grants). */
  planId: string;
  /** store_listings.id — preferred for vendor blueprint delivery. */
  listingId?: string;
  /** Index into the listing attachment array selected by fileKind. */
  fileIndex?: number;
  /** Which attachment array this grant unlocks. */
  fileKind?: DownloadFileKind;
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
  fileKind: DownloadFileKind = format === "cad" ? "cad" : "blueprint",
): DownloadGrant {
  const now = new Date();
  // Logged-in buyers keep long-lived re-download access; guests keep a short window.
  const ttlMs = userId
    ? 10 * 365 * 24 * 60 * 60 * 1000
    : 7 * 24 * 60 * 60 * 1000;
  const expires = new Date(now.getTime() + ttlMs);
  return {
    token: randomBytes(24).toString("hex"),
    planId,
    listingId,
    fileIndex: fileIndex ?? 0,
    fileKind,
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

export interface FulfillDownloadItem {
  planId: string;
  planDocumentId?: string;
  listingId?: string;
  /** Line-level package format (pdf default, cad when DWG package selected). */
  format?: "pdf" | "cad";
}

async function issueAssetGrants(opts: {
  item: FulfillDownloadItem;
  kind: DownloadFileKind;
  format: "pdf" | "cad";
  userId?: string;
  stripeSessionId?: string;
}): Promise<DownloadGrant[]> {
  const { item, kind, format, userId, stripeSessionId } = opts;
  if (!item.listingId) return [];
  const urls = await getListingAssetUrls(item.listingId, kind);
  const grants: DownloadGrant[] = [];
  for (let i = 0; i < urls.length; i++) {
    const grant = createDownloadToken(
      item.planId,
      format,
      userId,
      stripeSessionId,
      undefined,
      item.listingId,
      i,
      kind,
    );
    await storeDownloadGrant(grant);
    grants.push(grant);
  }
  return grants;
}

/**
 * Issue download grants for paid cart / buy-now items.
 * - Always unlocks blueprint PDFs when present
 * - Unlocks CAD when the line format is cad (or includeCad)
 * - Unlocks BOQ / calc sheets when those add-ons were purchased
 */
export async function fulfillCartDownloads(
  items: FulfillDownloadItem[],
  includeCad: boolean,
  userId?: string,
  stripeSessionId?: string,
  addons: readonly UpsellAddonId[] = [],
): Promise<DownloadGrant[]> {
  const grants: DownloadGrant[] = [];
  const wantBoq = addons.includes("boq-bundle");
  const wantCalc = addons.includes("calc-sheet");

  for (const item of items) {
    const wantCad = includeCad || item.format === "cad";
    let issuedVendor = false;

    if (item.listingId) {
      const blueprints = await issueAssetGrants({
        item,
        kind: "blueprint",
        format: "pdf",
        userId,
        stripeSessionId,
      });
      grants.push(...blueprints);
      issuedVendor = blueprints.length > 0;

      if (wantCad) {
        const cad = await issueAssetGrants({
          item,
          kind: "cad",
          format: "cad",
          userId,
          stripeSessionId,
        });
        grants.push(...cad);
        if (cad.length > 0) issuedVendor = true;
      }

      if (wantBoq) {
        const boq = await issueAssetGrants({
          item,
          kind: "boq",
          format: "pdf",
          userId,
          stripeSessionId,
        });
        grants.push(...boq);
      }

      if (wantCalc) {
        const calc = await issueAssetGrants({
          item,
          kind: "calc",
          format: "pdf",
          userId,
          stripeSessionId,
        });
        grants.push(...calc);
      }

      if (issuedVendor) continue;
    }

    // Legacy generative plans (no vendor blueprints): keep PDF (+ optional CAD) grants.
    if (item.planDocumentId) {
      const pdf = createDownloadToken(
        item.planId,
        "pdf",
        userId,
        stripeSessionId,
        item.planDocumentId,
        item.listingId,
        0,
        "blueprint",
      );
      await storeDownloadGrant(pdf);
      grants.push(pdf);
      if (wantCad) {
        const cad = createDownloadToken(
          item.planId,
          "cad",
          userId,
          stripeSessionId,
          item.planDocumentId,
          item.listingId,
          0,
          "cad",
        );
        await storeDownloadGrant(cad);
        grants.push(cad);
      }
      continue;
    }

    console.error(
      `[fulfill-downloads] No vendor assets or plan document for ${item.planId} (listing ${item.listingId ?? "n/a"})`,
    );
  }

  return grants;
}
