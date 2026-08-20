import { allocatePlanCode, buildAutoListingName } from "@/lib/store/plan-code";
import { createRandomId } from "@/lib/random-id";
import { attachListingSeo } from "@/lib/seo/listing-seo-generate";
import { buildListingSlug, ensureUniqueSlug } from "@/lib/seo/slug";
import type { StoreListing, VendorListing } from "@/lib/store/listing-types";
import { validateListingPrice } from "@/lib/store/listing-price";
import { supabaseGetAllListings } from "@/lib/supabase/store-listings";
import { getSupplierById } from "@/lib/supabase/suppliers";
import { supplierNeedsProductUrl } from "@/lib/store/supplier-platform";

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function strList(v: unknown, max = 12): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((u) => String(u).trim()).filter(Boolean).slice(0, max);
}

function asVendor(existing?: StoreListing | null): VendorListing | null {
  return existing ? (existing as VendorListing) : null;
}

function parseNonNegInt(
  raw: unknown,
  labelTh: string,
  opts?: { required?: boolean; existing?: number },
): number | undefined {
  if (raw === undefined) return opts?.existing;
  if (raw === null || raw === "") {
    if (opts?.required) throw new Error(`กรุณากรอก${labelTh}`);
    return undefined;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
    throw new Error(`${labelTh} ต้องเป็นจำนวนเต็มไม่ติดลบ (บาท)`);
  }
  return n;
}

/**
 * Build a VendorListing from admin form JSON (create or update).
 * Middleman catalogue model: render images + cost/sell/supplier — no delivery docs on-platform.
 */
export async function listingFromAdminBody(
  body: Record<string, unknown>,
  adminEmail: string,
  existing?: StoreListing | null,
): Promise<VendorListing> {
  const prev = asVendor(existing);
  const style = String(body.style ?? existing?.style ?? "modern").trim() || "modern";

  const image = String(body.image ?? existing?.image ?? "").trim();
  if (!image) throw new Error("กรุณาอัปโหลดรูปเรนเดอร์ 3D (รูปปก)");

  const floors = (num(body.floors, existing?.floors ?? 1) === 2 ? 2 : 1) as 1 | 2;
  const beds = Math.max(0, Math.round(num(body.beds, existing?.beds ?? 0)));
  const baths = Math.max(0, Math.round(num(body.baths, existing?.baths ?? 0)));

  const priceCheck = validateListingPrice(
    body.price !== undefined && body.price !== "" ? body.price : existing?.price,
    {
      rawBody: body,
      allowAdminTestPricing: true,
    },
  );
  if (!priceCheck.ok) throw new Error(priceCheck.errorTh);
  const price = priceCheck.price;

  const costPrice = parseNonNegInt(body.costPrice ?? body.cost_price, "ราคาต้นทุน", {
    required: !existing,
    existing: existing?.costPrice,
  });
  if (costPrice == null) throw new Error("กรุณากรอกราคาต้นทุน");

  const sitePlanAddonPrice = parseNonNegInt(
    body.sitePlanAddonPrice ?? body.site_plan_addon_price,
    "ราคาแพ็กเกจเสริม (แผนผังบริเวณ)",
    { existing: existing?.sitePlanAddonPrice },
  );

  const floorPlanUrls = strList(
    body.floorPlanUrls !== undefined ? body.floorPlanUrls : existing?.floorPlanUrls,
    12,
  );
  const renderUrls = strList(
    body.renderUrls !== undefined ? body.renderUrls : existing?.renderUrls,
    8,
  );

  const supplierId = String(
    body.supplierId ?? body.supplier_id ?? existing?.supplierId ?? "",
  ).trim();
  if (!supplierId) throw new Error("กรุณาเลือกซัพพลายเออร์");

  const supplier = await getSupplierById(supplierId);
  if (!supplier) throw new Error("ไม่พบซัพพลายเออร์ที่เลือก");
  const supplierName = supplier.name;

  let productUrl: string | undefined;
  const rawProductUrl = String(
    body.productUrl ?? body.product_url ?? existing?.productUrl ?? "",
  ).trim();
  if (supplierNeedsProductUrl(supplier)) {
    if (!rawProductUrl) {
      throw new Error("กรุณาใส่ลิงก์สินค้า (Product URL) สำหรับ Shopee / Lazada");
    }
    try {
      const u = new URL(rawProductUrl);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        throw new Error("invalid");
      }
      productUrl = u.toString();
    } catch {
      throw new Error("ลิงก์สินค้าต้องเป็น URL ที่ขึ้นต้นด้วย http:// หรือ https://");
    }
  } else {
    productUrl = undefined;
  }

  const areaRaw = String(body.area ?? existing?.area ?? "").trim();
  const area = areaRaw
    ? /sqm|ตร\.?\s*ม/i.test(areaRaw)
      ? areaRaw
      : `${areaRaw.replace(/[^\d.]/g, "") || "0"} sqm`
    : `${Math.max(0, num(body.widthMeters) * num(body.lengthMeters))} sqm`;
  const areaNum = Number((area.match(/[\d.]+/) ?? ["0"])[0]);
  if (!Number.isFinite(areaNum) || areaNum <= 0) {
    throw new Error("กรุณากรอกพื้นที่ใช้สอย (ตร.ม.) — ระบบใช้ค่านี้ในตัวกรองค้นหา");
  }

  // Delivery docs are ordered from the supplier after purchase — not stored on admin listings.
  // Preserve any legacy URLs on edit so older rows are not wiped accidentally.
  const blueprintPdfUrls =
    prev?.blueprintPdfUrls?.length
      ? prev.blueprintPdfUrls
      : prev?.blueprintPdfUrl
        ? [prev.blueprintPdfUrl]
        : [];
  const cadFileUrls = prev?.cadFileUrls ?? [];
  const boqFileUrls =
    prev?.boqFileUrls?.length ? prev.boqFileUrls : prev?.boqFileUrl ? [prev.boqFileUrl] : [];
  const calcSheetUrls = prev?.calcSheetUrls ?? [];

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

  const name = buildAutoListingName(style, planCode);

  const all = await supabaseGetAllListings();
  const used = new Set(all.filter((l) => l.id !== id).map((l) => l.slug));
  const base = buildListingSlug({ style, floors, beds, id, name });
  const slug = ensureUniqueSlug(base, used, id);

  const ownerId =
    existing?.ownerId && existing.ownerId !== "seed-demo"
      ? existing.ownerId
      : `admin:${adminEmail}`;

  const compareAt =
    body.compareAtPrice != null && body.compareAtPrice !== ""
      ? num(body.compareAtPrice)
      : existing?.compareAtPrice;

  const draft: VendorListing = {
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
    livingRooms: (() => {
      const raw = body.livingRooms ?? body.living_rooms;
      if (raw != null && raw !== "") return Math.max(0, Math.round(num(raw)));
      return existing?.livingRooms;
    })(),
    parking:
      body.parking != null && body.parking !== ""
        ? Math.max(0, Math.round(num(body.parking)))
        : existing?.parking,
    floors,
    area: `${areaNum} sqm`,
    style,
    collection: body.collection
      ? String(body.collection).trim() || undefined
      : existing?.collection,
    supplierName,
    supplierId,
    productUrl,
    sourcePlanCode: (() => {
      const raw = String(
        body.sourcePlanCode ?? body.source_plan_code ?? existing?.sourcePlanCode ?? "",
      ).trim();
      if (!raw) return undefined;
      if (raw.length > 120) {
        throw new Error("รหัสบ้านต้นทางยาวเกินไป (สูงสุด 120 ตัวอักษร)");
      }
      return raw;
    })(),
    costPrice,
    sitePlanAddonPrice,
    province: existing?.province,
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
    // Legacy add-on price columns unused in middleman main package (BOQ included).
    boqPrice: undefined,
    calcPrice: undefined,
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
    moderationStatus: "approved",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    blueprintPdfUrl: blueprintPdfUrls[0],
    blueprintPdfUrls,
    cadFileUrls,
    boqFileUrl: boqFileUrls[0],
    boqFileUrls,
    calcSheetUrls,
    hasCadFiles: cadFileUrls.length > 0,
    hasBoqFiles: boqFileUrls.length > 0,
    hasCalcSheets: calcSheetUrls.length > 0,
    // Main package is permit-ready + includes BOQ by product definition.
    permitReady: true,
    boqComplete: true,
    contractConsent: true,
    aiScreening: prev?.aiScreening,
  };

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
