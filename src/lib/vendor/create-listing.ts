import "server-only";

import {
  supabaseGetListingsByOwner,
  supabaseUpsertVendorListing,
} from "@/lib/supabase/store-listings";
import { getAllListingsForSitemap } from "@/lib/store/db";
import { allocatePlanCode } from "@/lib/store/plan-code";
import { buildListingSlug, ensureUniqueSlug } from "@/lib/seo/slug";
import { createRandomId } from "@/lib/random-id";
import type { VendorListing } from "@/lib/store/listing-types";
import { verifyVendorListing } from "@/lib/marketplace/listing-verify";
import { attachListingSeo } from "@/lib/seo/listing-seo-generate";
import { revalidateStoreSurfaces } from "@/lib/store/revalidate-store";
import { isListingPurchasable } from "@/lib/store/listing-purchase";
import { validateListingPrice } from "@/lib/store/listing-price";

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function fileList(list: unknown, legacy: unknown): string[] {
  const urls = Array.isArray(list) ? list.map((u) => String(u).trim()).filter(Boolean) : [];
  if (urls.length > 0) return Array.from(new Set(urls));
  const single = legacy ? String(legacy).trim() : "";
  return single ? [single] : [];
}

/**
 * Normalize test-spec / vendor payloads into the vendor listing body shape.
 * Accepts camelCase and common snake_case aliases (bedrooms, square_footage, …).
 */
export function normalizeListingUploadBody(raw: Record<string, unknown>): Record<string, unknown> {
  const images = Array.isArray(raw.images)
    ? raw.images.map((u) => String(u).trim()).filter(Boolean)
    : Array.isArray(raw.renderUrls)
      ? raw.renderUrls.map((u) => String(u).trim()).filter(Boolean)
      : [];
  const primaryImage =
    String(raw.image ?? raw.cover_image ?? raw.coverImage ?? images[0] ?? "").trim();
  const renderUrls = images.filter((u) => u !== primaryImage);

  const floorPlans = Array.isArray(raw.floor_plans)
    ? raw.floor_plans
    : Array.isArray(raw.floorPlans)
      ? raw.floorPlans
      : Array.isArray(raw.floorPlanUrls)
        ? raw.floorPlanUrls
        : [];

  const blueprints = Array.isArray(raw.technical_drawings)
    ? raw.technical_drawings
    : Array.isArray(raw.technicalDrawings)
      ? raw.technicalDrawings
      : Array.isArray(raw.pdfs)
        ? raw.pdfs
        : Array.isArray(raw.blueprintPdfUrls)
          ? raw.blueprintPdfUrls
          : raw.blueprint_pdf_url || raw.blueprintPdfUrl
            ? [raw.blueprint_pdf_url ?? raw.blueprintPdfUrl]
            : [];

  const areaRaw =
    raw.area ??
    raw.square_footage ??
    raw.squareFootage ??
    raw.sqm ??
    raw.area_sqm;
  const area =
    typeof areaRaw === "number"
      ? `${areaRaw} sqm`
      : areaRaw
        ? String(areaRaw).trim()
        : undefined;

  return {
    ...raw,
    name: raw.name ?? raw.title,
    image: primaryImage,
    renderUrls: Array.isArray(raw.renderUrls) ? raw.renderUrls : renderUrls,
    floorPlanUrls: floorPlans,
    blueprintPdfUrls: blueprints,
    blueprintPdfUrl: blueprints[0],
    beds: raw.beds ?? raw.bedrooms,
    baths: raw.baths ?? raw.bathrooms,
    area,
    price: raw.price ?? raw.price_thb ?? raw.priceThb,
  };
}

export type CreateVendorListingResult =
  | {
      ok: true;
      listing: VendorListing;
      is_approved: boolean;
      published: boolean;
      awaitingAdminApproval: boolean;
      aiScreening: VendorListing["aiScreening"];
    }
  | { ok: false; status: number; error: string; message?: string };

/**
 * Persist a vendor house-plan listing immediately.
 * New listings are visible with is_approved=false (purchase locked) until admin Approve.
 */
export async function createOrUpdateVendorListing(
  ownerKey: string,
  rawBody: Record<string, unknown>,
): Promise<CreateVendorListingResult> {
  const body = normalizeListingUploadBody(rawBody);
  const name = String(body.name ?? "").trim();
  const image = String(body.image ?? "").trim();
  if (!name) return { ok: false, status: 400, error: "name is required" };
  if (!image) return { ok: false, status: 400, error: "A render image is required" };

  const editingId = body.id ? String(body.id) : null;
  const style = String(body.style ?? "custom").trim() || "custom";

  let createdAt = new Date().toISOString();
  let planCode: string;
  let planDocumentId: string | undefined;
  let previousStatus: VendorListing["moderationStatus"];
  let previousPublished = true;
  let id: string;

  if (editingId) {
    const owned = await supabaseGetListingsByOwner(ownerKey);
    const existing = owned.find((l) => l.id === editingId);
    if (!existing) return { ok: false, status: 404, error: "Listing not found" };
    createdAt = existing.createdAt || createdAt;
    id = existing.id;
    planCode = existing.planCode || existing.planId || existing.id;
    planDocumentId = existing.planDocumentId;
    previousStatus = existing.moderationStatus;
    previousPublished = existing.isPublished !== false;
  } else {
    id = createRandomId();
    planCode = await allocatePlanCode(style);
  }

  const floors = (num(body.floors, 1) === 2 ? 2 : 1) as 1 | 2;
  const beds = Math.max(0, Math.round(num(body.beds, 0)));

  const renderUrlsEarly = Array.isArray(body.renderUrls)
    ? body.renderUrls.map((u: unknown) => String(u)).filter(Boolean).slice(0, 12)
    : [];
  const floorPlanUrlsEarly = Array.isArray(body.floorPlanUrls)
    ? body.floorPlanUrls.map((u: unknown) => String(u)).filter(Boolean).slice(0, 12)
    : [];
  const totalRenders = (image ? 1 : 0) + renderUrlsEarly.length;
  if (totalRenders < 2) {
    return {
      ok: false,
      status: 400,
      error: "At least 2 render images are required",
      message: "ต้องมีภาพเรนเดอร์ 3D อย่างน้อย 2 รูป",
    };
  }
  if (floorPlanUrlsEarly.length < 1) {
    return {
      ok: false,
      status: 400,
      error: "Floor plan required",
      message: "กรุณาอัปโหลดแปลนพื้นอย่างน้อย 1 รูป",
    };
  }
  const blueprintPdfUrls = fileList(body.blueprintPdfUrls, body.blueprintPdfUrl);
  const boqFileUrls = fileList(body.boqFileUrls, body.boqFileUrl);
  if (blueprintPdfUrls.length === 0) {
    return {
      ok: false,
      status: 400,
      error: "Blueprint PDF required",
      message: "กรุณาอัปโหลดไฟล์แบบแปลน PDF อย่างน้อย 1 ไฟล์",
    };
  }

  const all = await getAllListingsForSitemap();
  const used = new Set(all.filter((l) => l.id !== id).map((l) => l.slug));
  const base = buildListingSlug({ style, floors, beds, id, name });
  const slug = ensureUniqueSlug(base, used, id);

  const priceCheck = validateListingPrice(body.price, { rawBody: body });
  if (!priceCheck.ok) {
    return {
      ok: false,
      status: 400,
      error: priceCheck.error,
      message: priceCheck.errorTh,
    };
  }
  const price = priceCheck.price;

  const highlights = Array.isArray(body.highlights)
    ? body.highlights.map((h: unknown) => String(h).trim()).filter(Boolean).slice(0, 12)
    : [];

  const draft: VendorListing = {
    id,
    slug,
    planCode,
    planDocumentId,
    planId: planCode,
    ownerId: ownerKey,
    creatorBrowserId: ownerKey,
    name,
    description: String(body.description ?? "").trim() || name,
    tagline: body.tagline ? String(body.tagline).trim() : undefined,
    pitch: body.pitch ? String(body.pitch).trim() : undefined,
    highlights,
    beds,
    baths: Math.max(0, Math.round(num(body.baths, 0))),
    parking:
      body.parking != null && body.parking !== ""
        ? Math.max(0, Math.round(num(body.parking)))
        : undefined,
    floors,
    area: String(body.area ?? "").trim() || `${num(body.widthMeters) * num(body.lengthMeters)} sqm`,
    style,
    collection: body.collection ? String(body.collection).trim() : undefined,
    province: body.province ? String(body.province).trim() : undefined,
    widthMeters: body.widthMeters ? num(body.widthMeters) : undefined,
    lengthMeters: body.lengthMeters ? num(body.lengthMeters) : undefined,
    constructionCostEstimate: body.constructionCostEstimate
      ? num(body.constructionCostEstimate)
      : undefined,
    image,
    renderUrls: renderUrlsEarly,
    floorPlanUrls: floorPlanUrlsEarly,
    price,
    priceBreakdown: {
      base: price,
      floorSurcharge: 0,
      bedSurcharge: 0,
      bathSurcharge: 0,
      optionsSurcharge: 0,
      total: price,
      currency: "THB",
    },
    source: "vendor",
    createdAt,
    blueprintPdfUrl: blueprintPdfUrls[0],
    boqFileUrl: boqFileUrls[0],
    blueprintPdfUrls,
    boqFileUrls,
    permitReady: Boolean(body.permitReady),
    boqComplete: Boolean(body.boqComplete),
    contractConsent: Boolean(body.contractConsent),
    moderationStatus: "pending",
    // Preserve seller hide/unpublish across edits; new listings default published.
    isPublished: previousPublished,
  };

  const screening = await verifyVendorListing(draft);
  let moderationStatus: VendorListing["moderationStatus"] = "pending";
  if (!screening.approved) {
    moderationStatus = "rejected";
  } else if (editingId && previousStatus === "approved") {
    moderationStatus = "approved";
  } else {
    moderationStatus = "pending";
  }

  const listing: VendorListing = await attachListingSeo({
    ...draft,
    moderationStatus,
    aiScreening: screening,
  });

  const saved = await supabaseUpsertVendorListing(listing);
  revalidateStoreSurfaces({ slug: saved.slug, listingId: saved.id });

  return {
    ok: true,
    listing: saved,
    is_approved: isListingPurchasable(saved),
    published: screening.approved,
    awaitingAdminApproval: screening.approved && moderationStatus === "pending",
    aiScreening: screening,
  };
}
