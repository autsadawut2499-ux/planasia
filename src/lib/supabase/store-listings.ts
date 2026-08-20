import { STORE_LISTING_CATALOGUE_SELECT } from "@/lib/store/catalogue-columns";
import type { StoreListing, VendorListing } from "@/lib/store/listing-types";
import { resolvePlanIdentity } from "@/lib/store/plan-identity";
import { getSupabaseAdmin } from "@/lib/supabase/client";

interface StoreListingRow {
  id: string;
  slug: string;
  plan_id: string;
  /** New: mirrors marketplace code (may be null before migration backfill). */
  plan_code?: string | null;
  /** New: optional link to house_plans.id */
  plan_document_id?: string | null;
  owner_id: string;
  creator_browser_id: string;
  creator_session_user_id: string | null;
  creator_ip: string | null;
  creator_workspace_session_id: string | null;
  name: string;
  description: string;
  tagline: string | null;
  pitch: string | null;
  highlights: string[] | null;
  beds: number;
  baths: number;
  living_rooms?: number | null;
  parking: number | null;
  floors: number;
  area: string;
  style: string;
  collection: string | null;
  supplier_name?: string | null;
  supplier_id?: string | null;
  product_url?: string | null;
  source_plan_code?: string | null;
  cost_price?: number | null;
  site_plan_addon_price?: number | null;
  province: string | null;
  width_meters: number | null;
  length_meters: number | null;
  construction_cost_estimate: number | null;
  image: string;
  render_urls: string[] | null;
  floor_plan_urls: string[];
  price: number;
  boq_price?: number | null;
  calc_price?: number | null;
  boq_file_url?: string | null;
  boq_file_urls?: string[] | null;
  cad_file_urls?: string[] | null;
  calc_sheet_urls?: string[] | null;
  price_breakdown: StoreListing["priceBreakdown"] | null;
  project_snapshot: StoreListing["projectSnapshot"] | null;
  source: StoreListing["source"];
  created_at: string;
  likes_count?: number;
  views_count?: number;
  sales_count?: number;
  ranking_score?: number;
  pinned?: boolean;
  moderation_status?: "pending" | "approved" | "rejected" | null;
  is_published?: boolean | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_json_ld?: Record<string, unknown> | null;
  seo_generated_at?: string | null;
  seo_provider?: string | null;
}

function rowToListing(row: StoreListingRow): StoreListing {
  const identity = resolvePlanIdentity({
    planId: row.plan_id,
    planCode: row.plan_code,
    planDocumentId: row.plan_document_id,
  });
  return {
    id: row.id,
    slug: row.slug,
    planCode: identity.planCode,
    planDocumentId: identity.planDocumentId,
    planId: identity.planId,
    ownerId: row.owner_id,
    creatorBrowserId: row.creator_browser_id,
    creatorSessionUserId: row.creator_session_user_id ?? undefined,
    creatorIp: row.creator_ip ?? undefined,
    creatorWorkspaceSessionId: row.creator_workspace_session_id ?? undefined,
    name: row.name,
    description: row.description,
    tagline: row.tagline ?? undefined,
    pitch: row.pitch ?? undefined,
    highlights: row.highlights ?? [],
    beds: row.beds,
    baths: row.baths,
    livingRooms:
      row.living_rooms != null && Number.isFinite(Number(row.living_rooms))
        ? Number(row.living_rooms)
        : undefined,
    parking: row.parking != null ? Number(row.parking) : undefined,
    floors: row.floors as 1 | 2,
    area: row.area,
    style: row.style,
    collection: row.collection ?? undefined,
    supplierName: row.supplier_name ?? undefined,
    supplierId: row.supplier_id ?? undefined,
    productUrl: row.product_url?.trim() || undefined,
    sourcePlanCode: row.source_plan_code?.trim() || undefined,
    costPrice:
      row.cost_price != null && Number.isFinite(Number(row.cost_price))
        ? Number(row.cost_price)
        : undefined,
    sitePlanAddonPrice:
      row.site_plan_addon_price != null && Number.isFinite(Number(row.site_plan_addon_price))
        ? Number(row.site_plan_addon_price)
        : undefined,
    province: row.province ?? undefined,
    widthMeters: row.width_meters != null ? Number(row.width_meters) : undefined,
    lengthMeters: row.length_meters != null ? Number(row.length_meters) : undefined,
    constructionCostEstimate:
      row.construction_cost_estimate != null ? Number(row.construction_cost_estimate) : undefined,
    image: row.image,
    renderUrls: row.render_urls ?? [],
    floorPlanUrls: row.floor_plan_urls ?? [],
    price: Number(row.price),
    boqPrice:
      row.boq_price != null && Number.isFinite(Number(row.boq_price))
        ? Number(row.boq_price)
        : undefined,
    calcPrice:
      row.calc_price != null && Number.isFinite(Number(row.calc_price))
        ? Number(row.calc_price)
        : undefined,
    hasCadFiles: (row.cad_file_urls ?? []).filter(Boolean).length > 0,
    hasCalcSheets: (row.calc_sheet_urls ?? []).filter(Boolean).length > 0,
    hasBoqFiles:
      (row.boq_file_urls ?? []).filter(Boolean).length > 0 ||
      Boolean(row.boq_file_url?.trim()),
    priceBreakdown: row.price_breakdown ?? undefined,
    compareAtPrice:
      row.price_breakdown && typeof row.price_breakdown.compareAt === "number"
        ? row.price_breakdown.compareAt
        : undefined,
    projectSnapshot: row.project_snapshot ?? undefined,
    source: row.source,
    createdAt: row.created_at,
    likesCount: row.likes_count ?? 0,
    viewsCount: row.views_count ?? 0,
    salesCount: row.sales_count ?? 0,
    rankingScore: row.ranking_score ?? 0,
    pinned: row.pinned ?? false,
    moderationStatus: row.moderation_status ?? undefined,
    isPublished: row.is_published ?? true,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    seoJsonLd: row.seo_json_ld ?? undefined,
    seoGeneratedAt: row.seo_generated_at ?? undefined,
    seoProvider:
      row.seo_provider === "gemini" || row.seo_provider === "rules"
        ? row.seo_provider
        : undefined,
  };
}

function listingToRow(listing: StoreListing): StoreListingRow {
  const identity = resolvePlanIdentity({
    planId: listing.planId,
    planCode: listing.planCode,
    planDocumentId: listing.planDocumentId,
  });
  return {
    id: listing.id,
    slug: listing.slug,
    // Compat column stays the marketplace code when known.
    plan_id: identity.planCode,
    plan_code: identity.planCode,
    plan_document_id: identity.planDocumentId ?? null,
    owner_id: listing.ownerId,
    creator_browser_id: listing.creatorBrowserId,
    creator_session_user_id: listing.creatorSessionUserId ?? null,
    creator_ip: listing.creatorIp ?? null,
    creator_workspace_session_id: listing.creatorWorkspaceSessionId ?? null,
    name: listing.name,
    description: listing.description,
    tagline: listing.tagline ?? null,
    pitch: listing.pitch ?? null,
    highlights: listing.highlights ?? [],
    beds: listing.beds,
    baths: listing.baths,
    living_rooms: listing.livingRooms ?? null,
    parking: listing.parking ?? null,
    floors: listing.floors,
    area: listing.area,
    style: listing.style,
    collection: listing.collection ?? null,
    supplier_name: listing.supplierName ?? null,
    supplier_id: listing.supplierId ?? null,
    product_url: listing.productUrl ?? null,
    source_plan_code: listing.sourcePlanCode ?? null,
    cost_price: listing.costPrice ?? null,
    site_plan_addon_price: listing.sitePlanAddonPrice ?? null,
    province: listing.province ?? null,
    width_meters: listing.widthMeters ?? null,
    length_meters: listing.lengthMeters ?? null,
    construction_cost_estimate: listing.constructionCostEstimate ?? null,
    image: listing.image,
    render_urls: listing.renderUrls ?? [],
    floor_plan_urls: listing.floorPlanUrls,
    price: listing.price,
    boq_price: listing.boqPrice ?? null,
    calc_price: listing.calcPrice ?? null,
    price_breakdown: listing.priceBreakdown ?? null,
    project_snapshot: listing.projectSnapshot ?? null,
    source: listing.source,
    created_at: listing.createdAt,
    // Persist moderation status (verified designers save as approved).
    moderation_status: listing.moderationStatus ?? "pending",
    is_published: listing.isPublished !== false,
    seo_title: listing.seoTitle ?? null,
    seo_description: listing.seoDescription ?? null,
    seo_json_ld: listing.seoJsonLd ?? null,
    seo_generated_at: listing.seoGeneratedAt ?? null,
    seo_provider: listing.seoProvider ?? null,
  };
}

const PLAN_CODE_LIKE = /^[A-Za-z]{2,5}-\d+$/;

function isMissingPlanIdentityColumn(error: { message?: string } | null): boolean {
  const msg = error?.message?.toLowerCase() ?? "";
  return msg.includes("plan_code") || msg.includes("plan_document_id");
}

function isMissingSeoColumn(error: { message?: string } | null): boolean {
  const msg = error?.message?.toLowerCase() ?? "";
  return (
    msg.includes("seo_title") ||
    msg.includes("seo_description") ||
    msg.includes("seo_json_ld") ||
    msg.includes("seo_generated_at") ||
    msg.includes("seo_provider")
  );
}

function stripSeoColumns<T extends object>(row: T): T {
  const {
    seo_title: _t,
    seo_description: _d,
    seo_json_ld: _j,
    seo_generated_at: _a,
    seo_provider: _p,
    ...rest
  } = row as T & {
    seo_title?: unknown;
    seo_description?: unknown;
    seo_json_ld?: unknown;
    seo_generated_at?: unknown;
    seo_provider?: unknown;
  };
  return rest as T;
}

/** Strip newer columns when the DB migration has not been applied yet. */
function listingToCompatRow(listing: StoreListing): Omit<
  StoreListingRow,
  "plan_code" | "plan_document_id"
> {
  const full = listingToRow(listing);
  const { plan_code: _c, plan_document_id: _d, ...compat } = full;
  // Legacy AI path: keep document UUID in plan_id so downloads still resolve.
  if (listing.planDocumentId && !PLAN_CODE_LIKE.test(listing.planCode)) {
    return { ...compat, plan_id: listing.planDocumentId };
  }
  return compat;
}

interface VendorListingRow extends StoreListingRow {
  blueprint_pdf_url: string | null;
  boq_file_url: string | null;
  blueprint_pdf_urls: string[] | null;
  boq_file_urls: string[] | null;
  cad_file_urls: string[] | null;
  calc_sheet_urls: string[] | null;
  permit_ready: boolean | null;
  boq_complete: boolean | null;
  contract_consent: boolean | null;
  moderation_status: "pending" | "approved" | "rejected" | null;
  ai_screening: VendorListing["aiScreening"] | null;
}

/** Arrays are authoritative; legacy single-url rows are lifted into them. */
function attachmentList(list: string[] | null, legacy: string | null): string[] {
  const urls = (list ?? []).filter(Boolean);
  if (urls.length > 0) return urls;
  return legacy ? [legacy] : [];
}

function rowToVendorListing(row: VendorListingRow): VendorListing {
  const blueprintPdfUrls = attachmentList(row.blueprint_pdf_urls, row.blueprint_pdf_url);
  const boqFileUrls = attachmentList(row.boq_file_urls, row.boq_file_url);
  const cadFileUrls = (row.cad_file_urls ?? []).filter(Boolean);
  const calcSheetUrls = (row.calc_sheet_urls ?? []).filter(Boolean);
  return {
    ...rowToListing(row),
    blueprintPdfUrl: blueprintPdfUrls[0],
    boqFileUrl: boqFileUrls[0],
    blueprintPdfUrls,
    boqFileUrls,
    cadFileUrls,
    calcSheetUrls,
    hasCadFiles: cadFileUrls.length > 0,
    hasCalcSheets: calcSheetUrls.length > 0,
    hasBoqFiles: boqFileUrls.length > 0,
    permitReady: row.permit_ready ?? false,
    boqComplete: row.boq_complete ?? false,
    contractConsent: row.contract_consent ?? false,
    moderationStatus: row.moderation_status ?? undefined,
    aiScreening: row.ai_screening ?? undefined,
  };
}

/** Owner-scoped listings including the private blueprint PDF url (dashboard). */
export async function supabaseGetListingsByOwner(ownerKey: string): Promise<VendorListing[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .eq("owner_id", ownerKey)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as VendorListingRow[]).map(rowToVendorListing);
}

/** Upsert including the private blueprint PDF url (vendor create/edit). */
export async function supabaseUpsertVendorListing(listing: VendorListing): Promise<VendorListing> {
  // Delivery docs: exactly one URL slot per field (arrays kept for schema compat).
  const blueprintPdfUrls = attachmentList(
    listing.blueprintPdfUrls ?? null,
    listing.blueprintPdfUrl ?? null,
  ).slice(0, 1);
  const boqFileUrls = attachmentList(
    listing.boqFileUrls ?? null,
    listing.boqFileUrl ?? null,
  ).slice(0, 1);
  const cadFileUrls = (listing.cadFileUrls ?? []).filter(Boolean).slice(0, 1);
  const calcSheetUrls = (listing.calcSheetUrls ?? []).filter(Boolean).slice(0, 1);
  const base = listingToRow(listing);
  const row = {
    ...base,
    // Legacy single-url columns stay in sync so older readers keep working.
    blueprint_pdf_url: blueprintPdfUrls[0] ?? null,
    boq_file_url: boqFileUrls[0] ?? null,
    blueprint_pdf_urls: blueprintPdfUrls,
    boq_file_urls: boqFileUrls,
    cad_file_urls: cadFileUrls,
    calc_sheet_urls: calcSheetUrls,
    boq_price: listing.boqPrice ?? null,
    calc_price: listing.calcPrice ?? null,
    permit_ready: listing.permitReady ?? false,
    boq_complete: listing.boqComplete ?? false,
    contract_consent: listing.contractConsent ?? false,
    moderation_status: listing.moderationStatus ?? "pending",
    ai_screening: listing.aiScreening ?? null,
  };
  const first = await getSupabaseAdmin()
    .from("store_listings")
    .upsert(row, { onConflict: "id" })
    .select("*")
    .single();
  if (!first.error) return rowToVendorListing(first.data as VendorListingRow);

  if (isMissingSeoColumn(first.error)) {
    const withoutSeo = stripSeoColumns(row);
    const retry = await getSupabaseAdmin()
      .from("store_listings")
      .upsert(withoutSeo, { onConflict: "id" })
      .select("*")
      .single();
    if (!retry.error) return rowToVendorListing(retry.data as VendorListingRow);
    if (!isMissingPlanIdentityColumn(retry.error)) throw retry.error;
  } else if (!isMissingPlanIdentityColumn(first.error)) {
    throw first.error;
  }

  const { plan_code: _c, plan_document_id: _d, ...compatBase } = base;
  const compatRow = stripSeoColumns({
    ...compatBase,
    blueprint_pdf_url: blueprintPdfUrls[0] ?? null,
    boq_file_url: boqFileUrls[0] ?? null,
    blueprint_pdf_urls: blueprintPdfUrls,
    boq_file_urls: boqFileUrls,
    cad_file_urls: cadFileUrls,
    calc_sheet_urls: calcSheetUrls,
    boq_price: listing.boqPrice ?? null,
    calc_price: listing.calcPrice ?? null,
    permit_ready: listing.permitReady ?? false,
    boq_complete: listing.boqComplete ?? false,
    contract_consent: listing.contractConsent ?? false,
    moderation_status: listing.moderationStatus ?? "pending",
    ai_screening: listing.aiScreening ?? null,
  });
  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .upsert(compatRow, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return rowToVendorListing(data as VendorListingRow);
}

/**
 * Auto-publish a verified designer's pending listings (e.g. right after KYC pass).
 * Skips rejected rows — those need a fresh seller edit + AI pass.
 */
export async function supabasePublishPendingListings(ownerKey: string): Promise<number> {
  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .update({ moderation_status: "approved" })
    .eq("owner_id", ownerKey)
    .eq("moderation_status", "pending")
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

/** Admin: unlock (or re-lock) purchase for a listing. */
export async function supabaseSetListingModerationStatus(
  listingId: string,
  status: "pending" | "approved" | "rejected",
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("store_listings")
    .update({ moderation_status: status })
    .eq("id", listingId);
  if (error) throw error;
}

/** Vendor: hide/unpublish without deleting (owner-scoped). */
export async function supabaseSetListingPublished(
  id: string,
  ownerKey: string,
  isPublished: boolean,
): Promise<VendorListing | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .update({ is_published: isPublished })
    .eq("id", id)
    .eq("owner_id", ownerKey)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? rowToVendorListing(data as VendorListingRow) : null;
}

export async function supabaseDeleteListing(id: string, ownerKey: string): Promise<boolean> {
  const { error, count } = await getSupabaseAdmin()
    .from("store_listings")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("owner_id", ownerKey);
  if (error) throw error;
  return (count ?? 0) > 0;
}

/** Admin hard-delete — no owner scope. */
export async function supabaseDeleteListingById(id: string): Promise<boolean> {
  const { error, count } = await getSupabaseAdmin()
    .from("store_listings")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  return (count ?? 0) > 0;
}

/**
 * Remove demo / AI-community placeholder listings so the store only shows
 * real vendor or admin-managed plans.
 */
export async function supabaseDeleteDummyListings(): Promise<number> {
  const { data: rows, error: selectError } = await getSupabaseAdmin()
    .from("store_listings")
    .select("id")
    .or("source.eq.seed-demo,source.eq.community-ai,owner_id.eq.seed-demo");
  if (selectError) throw selectError;
  const ids = (rows ?? []).map((r) => (r as { id: string }).id);
  if (ids.length === 0) return 0;

  const { error, count } = await getSupabaseAdmin()
    .from("store_listings")
    .delete({ count: "exact" })
    .in("id", ids);
  if (error) throw error;
  return count ?? ids.length;
}

export async function supabaseGetAllListings(): Promise<StoreListing[]> {
  // Public search / storefront: published + admin-approved only
  // (legacy null moderation treated as approved). Pending stays in vendor/admin views.
  // Lean column projection — skips project_snapshot / seo_json_ld / galleries.
  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .select(STORE_LISTING_CATALOGUE_SELECT)
    .or("moderation_status.eq.approved,moderation_status.is.null")
    .or("is_published.eq.true,is_published.is.null")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as unknown as StoreListingRow[]).map(rowToListing);
}

// ---------------------------------------------------------------------------
// Smart Ranking
// ---------------------------------------------------------------------------

/** Atomic engagement counter bump (view / like / sale). Fire-and-forget safe. */
export async function supabaseIncrementCounter(
  listingId: string,
  field: "likes" | "views" | "sales",
): Promise<void> {
  const { error } = await getSupabaseAdmin().rpc("increment_listing_counter", {
    p_listing_id: listingId,
    p_field: field,
  });
  if (error) throw error;
}

/** Recompute all cached ranking scores with the given weights. Returns row count. */
export async function supabaseRecomputeRanking(params: {
  likeWeight: number;
  viewWeight: number;
  salesWeight: number;
  gravity: number;
}): Promise<number> {
  const { data, error } = await getSupabaseAdmin().rpc("recompute_ranking_scores", {
    w_like: params.likeWeight,
    w_view: params.viewWeight,
    w_sales: params.salesWeight,
    gravity: params.gravity,
  });
  if (error) throw error;
  return (data as number) ?? 0;
}

/** Top catalogue listings ordered by pin then cached score (home page). */
export async function supabaseGetPopularListings(limit = 60): Promise<StoreListing[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .select(STORE_LISTING_CATALOGUE_SELECT)
    .or("moderation_status.eq.approved,moderation_status.is.null")
    .or("is_published.eq.true,is_published.is.null")
    .order("pinned", { ascending: false })
    .order("pinned_at", { ascending: false, nullsFirst: false })
    .order("ranking_score", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as unknown as StoreListingRow[]).map(rowToListing);
}

/** All listings (any status) for the admin ranking / listings console (includes delivery docs). */
export async function supabaseGetListingsForAdmin(limit = 200): Promise<VendorListing[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 1000));
  if (error) throw error;
  return (data as VendorListingRow[]).map(rowToVendorListing);
}

/** Admin: single listing including private delivery-document refs. */
export async function supabaseGetVendorListingById(id: string): Promise<VendorListing | null> {
  const byId = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (byId.data) return rowToVendorListing(byId.data as VendorListingRow);
  if (byId.error) throw byId.error;

  const byPlan = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .eq("plan_id", id)
    .maybeSingle();
  if (byPlan.error) throw byPlan.error;
  return byPlan.data ? rowToVendorListing(byPlan.data as VendorListingRow) : null;
}

export async function supabaseSetPinned(listingId: string, pinned: boolean): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("store_listings")
    .update({ pinned, pinned_at: pinned ? new Date().toISOString() : null })
    .eq("id", listingId);
  if (error) throw error;
}

export async function supabaseGetListingById(id: string): Promise<StoreListing | null> {
  const byId = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (byId.data) return rowToListing(byId.data as StoreListingRow);
  if (byId.error) throw byId.error;

  const byPlan = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .eq("plan_id", id)
    .maybeSingle();
  if (byPlan.error) throw byPlan.error;
  return byPlan.data ? rowToListing(byPlan.data as StoreListingRow) : null;
}

export async function supabaseGetListingBySlug(slug: string): Promise<StoreListing | null> {
  for (const column of ["slug", "id", "plan_id", "plan_code"] as const) {
    const { data, error } = await getSupabaseAdmin()
      .from("store_listings")
      .select("*")
      .eq(column, slug)
      .maybeSingle();
    // plan_code may not exist before migration — ignore unknown-column errors.
    if (error) {
      if (column === "plan_code") continue;
      throw error;
    }
    if (data) return rowToListing(data as StoreListingRow);
  }
  return null;
}

export async function supabaseGetListingByPlanId(planId: string): Promise<StoreListing | null> {
  const byPlanId = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .eq("plan_id", planId)
    .maybeSingle();
  if (byPlanId.error) throw byPlanId.error;
  if (byPlanId.data) return rowToListing(byPlanId.data as StoreListingRow);

  const byCode = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .eq("plan_code", planId)
    .maybeSingle();
  if (byCode.error) {
    // Column may not exist yet.
    return null;
  }
  return byCode.data ? rowToListing(byCode.data as StoreListingRow) : null;
}

export async function supabaseGetListingByPlanDocumentId(
  planDocumentId: string,
): Promise<StoreListing | null> {
  const byDoc = await getSupabaseAdmin()
    .from("store_listings")
    .select("*")
    .eq("plan_document_id", planDocumentId)
    .maybeSingle();
  if (!byDoc.error && byDoc.data) {
    return rowToListing(byDoc.data as StoreListingRow);
  }

  // Legacy AI listings stored the document UUID in plan_id.
  return supabaseGetListingByPlanId(planDocumentId);
}

export async function supabaseUpsertListing(listing: StoreListing): Promise<StoreListing> {
  const full = listingToRow(listing);
  const first = await getSupabaseAdmin()
    .from("store_listings")
    .upsert(full, { onConflict: "id" })
    .select("*")
    .single();

  if (!first.error) return rowToListing(first.data as StoreListingRow);

  if (isMissingSeoColumn(first.error)) {
    const withoutSeo = stripSeoColumns(full);
    const retry = await getSupabaseAdmin()
      .from("store_listings")
      .upsert(withoutSeo, { onConflict: "id" })
      .select("*")
      .single();
    if (!retry.error) return rowToListing(retry.data as StoreListingRow);
    if (!isMissingPlanIdentityColumn(retry.error)) throw retry.error;
  } else if (!isMissingPlanIdentityColumn(first.error)) {
    throw first.error;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .upsert(stripSeoColumns(listingToCompatRow(listing)), { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return rowToListing(data as StoreListingRow);
}

export async function supabaseSeedIfEmpty(seed: StoreListing[]): Promise<void> {
  const { count, error: countError } = await getSupabaseAdmin()
    .from("store_listings")
    .select("*", { count: "exact", head: true });

  if (countError) throw countError;
  if ((count ?? 0) > 0) return;

  const { error } = await getSupabaseAdmin()
    .from("store_listings")
    .insert(seed.map(listingToRow));

  if (error) throw error;
}

/** Insert any demo seed rows that are missing (e.g. seed-3 added after first boot). */
export async function supabaseEnsureDemoSeeds(seed: StoreListing[]): Promise<void> {
  if (seed.length === 0) return;
  const ids = seed.map((s) => s.id);
  const { data, error } = await getSupabaseAdmin()
    .from("store_listings")
    .select("id")
    .in("id", ids);
  if (error) throw error;

  const existing = new Set((data ?? []).map((row) => (row as { id: string }).id));
  const missing = seed.filter((s) => !existing.has(s.id));
  if (missing.length === 0) return;

  const { error: insertError } = await getSupabaseAdmin()
    .from("store_listings")
    .insert(missing.map(listingToRow));
  if (insertError) throw insertError;
}
