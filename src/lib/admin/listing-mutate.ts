import { allocatePlanCode, buildAutoListingName } from "@/lib/store/plan-code";
import { createRandomId } from "@/lib/random-id";
import { attachListingSeo } from "@/lib/seo/listing-seo-generate";
import { buildListingSlug, ensureUniqueSlug } from "@/lib/seo/slug";
import type { StoreListing, VendorListing } from "@/lib/store/listing-types";
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

/** Exactly one delivery-doc URL slot (schema keeps arrays for compat). */
function fileList(v: unknown, max = 1): string[] {
  return strList(v, max);
}

function asVendor(existing?: StoreListing | null): VendorListing | null {
  return existing ? (existing as VendorListing) : null;
}

function looksLikePdfUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes(".pdf") || lower.startsWith("planasia-private://");
}

function looksLikeDwgUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes(".dwg") || lower.startsWith("planasia-private://");
}

function assertSinglePdf(urls: string[], labelTh: string): void {
  if (urls.length === 0) return;
  if (urls.length > 1) throw new Error(`${labelTh}: อัปโหลดได้ 1 ไฟล์เท่านั้น`);
  if (!looksLikePdfUrl(urls[0])) throw new Error(`${labelTh}: ต้องเป็นไฟล์ PDF`);
}

function assertSingleDwg(urls: string[], labelTh: string): void {
  if (urls.length === 0) return;
  if (urls.length > 1) throw new Error(`${labelTh}: อัปโหลดได้ 1 ไฟล์เท่านั้น`);
  if (!looksLikeDwgUrl(urls[0])) throw new Error(`${labelTh}: ต้องเป็นไฟล์ AutoCAD (.dwg)`);
}

/**
 * Build a VendorListing from admin form JSON (create or update).
 * Validation / field shape mirrors the vendor submission flow.
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
      // Admin console may set ฿10+ for live Stripe smoke tests.
      allowAdminTestPricing: true,
    },
  );
  if (!priceCheck.ok) throw new Error(priceCheck.errorTh);
  const price = priceCheck.price;

  const floorPlanUrls = strList(
    body.floorPlanUrls !== undefined ? body.floorPlanUrls : existing?.floorPlanUrls,
    12,
  );
  const renderUrls = strList(
    body.renderUrls !== undefined ? body.renderUrls : existing?.renderUrls,
    8,
  );
  if (floorPlanUrls.length < 1) throw new Error("กรุณาอัปโหลดแปลนพื้นอย่างน้อย 1 รูป");

  const province = String(body.province ?? existing?.province ?? "").trim();
  if (!province) throw new Error("กรุณาเลือกจังหวัดที่ให้บริการ");

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

  const blueprintPdfUrls =
    body.blueprintPdfUrls !== undefined
      ? fileList(body.blueprintPdfUrls, 1)
      : (prev?.blueprintPdfUrls ??
        (prev?.blueprintPdfUrl ? [prev.blueprintPdfUrl] : []));
  if (blueprintPdfUrls.length !== 1) {
    throw new Error("กรุณาอัปโหลดไฟล์แบบแปลนหลัก PDF (1 ไฟล์)");
  }

  const cadFileUrls =
    body.cadFileUrls !== undefined
      ? fileList(body.cadFileUrls, 1)
      : (prev?.cadFileUrls ?? []);
  const boqFileUrls =
    body.boqFileUrls !== undefined
      ? fileList(body.boqFileUrls, 1)
      : (prev?.boqFileUrls ?? (prev?.boqFileUrl ? [prev.boqFileUrl] : []));
  const calcSheetUrls =
    body.calcSheetUrls !== undefined
      ? fileList(body.calcSheetUrls, 1)
      : (prev?.calcSheetUrls ?? []);

  assertSinglePdf(blueprintPdfUrls, "แบบแปลนหลัก");
  assertSingleDwg(cadFileUrls, "ไฟล์ AutoCAD");
  assertSinglePdf(boqFileUrls, "ไฟล์ BOQ");
  assertSinglePdf(calcSheetUrls, "รายการคำนวณ");

  const contractConsent =
    body.contractConsent !== undefined
      ? Boolean(body.contractConsent)
      : (prev?.contractConsent ?? false);
  if (!contractConsent) {
    throw new Error(
      "กรุณายืนยันว่าผลงานเป็นลิขสิทธิ์แท้ของผู้ขาย และยินยอมตามเงื่อนไขของแพลตฟอร์ม",
    );
  }

  let boqPrice: number | undefined;
  if (body.boqPrice != null && body.boqPrice !== "") {
    const n = Number(body.boqPrice);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      throw new Error("ราคา BOQ ต้องเป็นจำนวนเต็มไม่ติดลบ (บาท)");
    }
    boqPrice = n;
  } else if (body.boqPrice === "" || body.boqPrice === null) {
    boqPrice = undefined;
  } else {
    boqPrice = prev?.boqPrice;
  }

  let calcPrice: number | undefined;
  if (body.calcPrice != null && body.calcPrice !== "") {
    const n = Number(body.calcPrice);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      throw new Error("ราคารายการคำนวณต้องเป็นจำนวนเต็มไม่ติดลบ (บาท)");
    }
    calcPrice = n;
  } else if (body.calcPrice === "" || body.calcPrice === null) {
    calcPrice = undefined;
  } else {
    calcPrice = prev?.calcPrice;
  }

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

  // Same naming as vendor: "{PlanCode} {Style}" (e.g. MOD-001 Modern).
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

  const permitReady =
    body.permitReady !== undefined ? Boolean(body.permitReady) : (prev?.permitReady ?? false);
  const boqComplete =
    body.boqComplete !== undefined ? Boolean(body.boqComplete) : (prev?.boqComplete ?? false);

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
    province,
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
    boqPrice,
    calcPrice,
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
    blueprintPdfUrl: blueprintPdfUrls[0],
    blueprintPdfUrls,
    cadFileUrls,
    boqFileUrl: boqFileUrls[0],
    boqFileUrls,
    calcSheetUrls,
    hasCadFiles: cadFileUrls.length > 0,
    hasBoqFiles: boqFileUrls.length > 0,
    hasCalcSheets: calcSheetUrls.length > 0,
    permitReady,
    boqComplete,
    contractConsent,
    aiScreening: prev?.aiScreening,
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
