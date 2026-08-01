import { allocatePlanCode } from "@/lib/store/plan-code";
import { createRandomId } from "@/lib/random-id";
import { attachListingSeo } from "@/lib/seo/listing-seo-generate";
import { buildListingSlug, ensureUniqueSlug } from "@/lib/seo/slug";
import type { StoreListing } from "@/lib/store/listing-types";
import { validateListingPrice } from "@/lib/store/listing-price";
import { supabaseGetAllListings } from "@/lib/supabase/store-listings";

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function strList(v: unknown, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((u) => String(u).trim()).filter(Boolean).slice(0, max);
}

/** Build a StoreListing from admin form JSON (create or update). */
export async function listingFromAdminBody(
  body: Record<string, unknown>,
  adminEmail: string,
  existing?: StoreListing | null,
): Promise<StoreListing> {
  const style = String(body.style ?? existing?.style ?? "modern").trim() || "modern";
  const name = String(body.name ?? existing?.name ?? "").trim();
  if (!name) throw new Error("กรุณากรอกชื่อแบบบ้าน");

  const image = String(body.image ?? existing?.image ?? "").trim();
  if (!image) throw new Error("กรุณาอัปโหลดรูปปก");

  const floors = (num(body.floors, existing?.floors ?? 1) === 2 ? 2 : 1) as 1 | 2;
  const beds = Math.max(0, Math.round(num(body.beds, existing?.beds ?? 0)));
  const baths = Math.max(0, Math.round(num(body.baths, existing?.baths ?? 0)));
  const priceCheck = validateListingPrice(
    body.price !== undefined && body.price !== "" ? body.price : existing?.price,
    { rawBody: body },
  );
  if (!priceCheck.ok) throw new Error(priceCheck.errorTh);
  const price = priceCheck.price;

  const floorPlanUrls = strList(
    body.floorPlanUrls !== undefined ? body.floorPlanUrls : existing?.floorPlanUrls,
    3,
  );
  const renderUrls = strList(
    body.renderUrls !== undefined ? body.renderUrls : existing?.renderUrls,
    9,
  );

  const id = existing?.id ?? createRandomId();
  const planCode =
    existing?.planCode ??
    existing?.planId ??
    (body.planCode
      ? String(body.planCode).trim()
      : body.planId
        ? String(body.planId).trim()
        : await allocatePlanCode(style));
  const planDocumentId =
    existing?.planDocumentId ??
    (body.planDocumentId ? String(body.planDocumentId).trim() || undefined : undefined);

  const all = await supabaseGetAllListings();
  const used = new Set(all.filter((l) => l.id !== id).map((l) => l.slug));
  const base = buildListingSlug({ style, floors, beds, id, name });
  const slug = ensureUniqueSlug(base, used, id);

  const areaRaw = String(body.area ?? existing?.area ?? "").trim();
  const area = areaRaw
    ? /sqm|ตร\.?\s*ม/i.test(areaRaw)
      ? areaRaw
      : `${areaRaw.replace(/[^\d.]/g, "") || "0"} sqm`
    : `${Math.max(0, num(body.widthMeters) * num(body.lengthMeters))} sqm`;

  const ownerId =
    existing?.ownerId && existing.ownerId !== "seed-demo"
      ? existing.ownerId
      : `admin:${adminEmail}`;

  const compareAt =
    body.compareAtPrice != null && body.compareAtPrice !== ""
      ? num(body.compareAtPrice)
      : existing?.compareAtPrice;

  const draft: StoreListing = {
    id,
    slug,
    planCode,
    planDocumentId,
    planId: planCode,
    ownerId,
    creatorBrowserId: existing?.creatorBrowserId ?? ownerId,
    name,
    description: String(body.description ?? existing?.description ?? "").trim() || name,
    tagline:
      body.tagline != null ? String(body.tagline).trim() || undefined : existing?.tagline,
    pitch: body.pitch != null ? String(body.pitch).trim() || undefined : existing?.pitch,
    highlights: Array.isArray(body.highlights)
      ? strList(body.highlights, 12)
      : (existing?.highlights ?? []),
    beds,
    baths,
    parking:
      body.parking != null && body.parking !== ""
        ? Math.max(0, Math.round(num(body.parking)))
        : existing?.parking,
    floors,
    area,
    style,
    collection: body.collection
      ? String(body.collection).trim() || undefined
      : existing?.collection,
    province: body.province
      ? String(body.province).trim() || undefined
      : existing?.province,
    widthMeters:
      body.widthMeters != null && body.widthMeters !== ""
        ? num(body.widthMeters)
        : existing?.widthMeters,
    lengthMeters:
      body.lengthMeters != null && body.lengthMeters !== ""
        ? num(body.lengthMeters)
        : existing?.lengthMeters,
    constructionCostEstimate:
      body.constructionCostEstimate != null && body.constructionCostEstimate !== ""
        ? num(body.constructionCostEstimate)
        : existing?.constructionCostEstimate,
    compareAtPrice: compareAt && compareAt > 0 ? compareAt : undefined,
    image,
    renderUrls,
    floorPlanUrls,
    price,
    priceBreakdown: {
      base: price,
      floorSurcharge: 0,
      bedSurcharge: 0,
      bathSurcharge: 0,
      optionsSurcharge: 0,
      total: price,
      currency: "THB",
      ...(compareAt && compareAt > price ? { compareAt } : {}),
    },
    source: "vendor",
    /** Admin-authored listings are purchase-ready immediately. */
    moderationStatus: "approved",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };

  // Fresh Gemini/rules SEO on every admin create/update.
  return attachListingSeo(draft);
}

export async function markListingApproved(id: string): Promise<void> {
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase/client");
    await getSupabaseAdmin()
      .from("store_listings")
      .update({ moderation_status: "approved" })
      .eq("id", id);
  } catch {
    /* older schemas may lack the column */
  }
}
