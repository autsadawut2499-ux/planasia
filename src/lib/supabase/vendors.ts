import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export interface VendorProfile {
  id: string;
  ownerKey: string;
  displayName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  /** Square brand logo shown beside the studio name. */
  brandImageUrl?: string;
  /** Showcase images displayed on the public profile. */
  galleryUrls: string[];
  location?: string;
  /** ISO alpha-2 country code (pan-Asia). See lib/geo/asia-countries. */
  countryCode?: string;
  specialties: string[];
  contactEmail?: string;
  contactPhone?: string;
  lineId?: string;
  website?: string;
  socials: string[];
  yearsExperience?: number;
  isPublished: boolean;
  isVerified: boolean;
  rating?: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface VendorRow {
  id: string;
  owner_key: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  brand_image_url: string | null;
  gallery_urls: string[] | null;
  location: string | null;
  country_code: string | null;
  specialties: string[] | null;
  contact_email: string | null;
  contact_phone: string | null;
  line_id: string | null;
  website: string | null;
  socials: string[] | null;
  years_experience: number | null;
  is_published: boolean;
  is_verified: boolean;
  rating: number | null;
  review_count: number;
  created_at: string;
  updated_at: string;
}

function rowToVendor(row: VendorRow): VendorProfile {
  return {
    id: row.id,
    ownerKey: row.owner_key,
    displayName: row.display_name,
    headline: row.headline ?? undefined,
    bio: row.bio ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    brandImageUrl: row.brand_image_url ?? undefined,
    galleryUrls: row.gallery_urls ?? [],
    location: row.location ?? undefined,
    countryCode: row.country_code ?? undefined,
    specialties: row.specialties ?? [],
    contactEmail: row.contact_email ?? undefined,
    contactPhone: row.contact_phone ?? undefined,
    lineId: row.line_id ?? undefined,
    website: row.website ?? undefined,
    socials: row.socials ?? [],
    yearsExperience: row.years_experience ?? undefined,
    isPublished: row.is_published,
    isVerified: row.is_verified,
    rating: row.rating ?? undefined,
    reviewCount: row.review_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPublishedVendors(): Promise<VendorProfile[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("vendor_profiles")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as VendorRow[]).map(rowToVendor);
}

export async function getVendorByOwnerKey(ownerKey: string): Promise<VendorProfile | null> {
  if (!isSupabaseConfigured() || !ownerKey) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("vendor_profiles")
    .select("*")
    .eq("owner_key", ownerKey)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToVendor(data as VendorRow) : null;
}

// ---------------------------------------------------------------------------
// Private commercial data (bank payout + KYC) — stored in vendor_private so it
// can never leak through the public directory. Service-role access only.
// ---------------------------------------------------------------------------

export interface VendorPayout {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  promptPay?: string;
}

export type VerificationStatus = "unverified" | "pending" | "approved" | "rejected";

/** KYC identity document type accepted for architect/draftsman verification. */
export type KycDocType = "national_id" | "passport" | "driver_license" | "professional_license";

/** Structured Know-Your-Customer identity data (verified before selling). */
export interface KycInfo {
  legalName: string;
  docType: KycDocType;
  docNumber: string;
  countryCode: string;
  dateOfBirth?: string;
  address?: string;
}

export interface VendorPrivate {
  ownerKey: string;
  payout: VendorPayout;
  verification: { documents: string[]; note?: string };
  verificationStatus: VerificationStatus;
  verificationSubmittedAt?: string;
  kyc?: KycInfo;
  verificationReviewedAt?: string;
  verificationReviewedBy?: string;
  verificationRejectReason?: string;
}

interface VendorPrivateRow {
  owner_key: string;
  payout: VendorPayout | null;
  verification: { documents?: string[]; note?: string } | null;
  verification_status: VerificationStatus;
  verification_submitted_at: string | null;
  kyc: KycInfo | null;
  verification_reviewed_at: string | null;
  verification_reviewed_by: string | null;
  verification_reject_reason: string | null;
}

function rowToPrivate(row: VendorPrivateRow): VendorPrivate {
  return {
    ownerKey: row.owner_key,
    payout: row.payout ?? {},
    verification: { documents: row.verification?.documents ?? [], note: row.verification?.note },
    verificationStatus: row.verification_status,
    verificationSubmittedAt: row.verification_submitted_at ?? undefined,
    kyc: row.kyc ?? undefined,
    verificationReviewedAt: row.verification_reviewed_at ?? undefined,
    verificationReviewedBy: row.verification_reviewed_by ?? undefined,
    verificationRejectReason: row.verification_reject_reason ?? undefined,
  };
}

export async function getVendorPrivate(ownerKey: string): Promise<VendorPrivate | null> {
  if (!isSupabaseConfigured() || !ownerKey) return null;
  const { data, error } = await getSupabaseAdmin()
    .from("vendor_private")
    .select("*")
    .eq("owner_key", ownerKey)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPrivate(data as VendorPrivateRow) : null;
}

export async function upsertVendorPayout(ownerKey: string, payout: VendorPayout): Promise<VendorPrivate> {
  const { data, error } = await getSupabaseAdmin()
    .from("vendor_private")
    .upsert(
      { owner_key: ownerKey, payout, updated_at: new Date().toISOString() },
      { onConflict: "owner_key" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return rowToPrivate(data as VendorPrivateRow);
}

export async function submitVendorVerification(
  ownerKey: string,
  documents: string[],
  note?: string,
): Promise<VendorPrivate> {
  const { data, error } = await getSupabaseAdmin()
    .from("vendor_private")
    .upsert(
      {
        owner_key: ownerKey,
        verification: { documents, note: note ?? null },
        verification_status: "pending",
        verification_submitted_at: new Date().toISOString(),
        verification_reject_reason: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_key" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return rowToPrivate(data as VendorPrivateRow);
}

/** Submit a full KYC package (structured identity + documents) for review. */
export async function submitVendorKyc(
  ownerKey: string,
  input: { kyc: KycInfo; documents: string[]; note?: string },
): Promise<VendorPrivate> {
  const { data, error } = await getSupabaseAdmin()
    .from("vendor_private")
    .upsert(
      {
        owner_key: ownerKey,
        kyc: input.kyc,
        verification: { documents: input.documents, note: input.note ?? null },
        verification_status: "pending",
        verification_submitted_at: new Date().toISOString(),
        verification_reject_reason: null,
        verification_reviewed_at: null,
        verification_reviewed_by: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_key" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return rowToPrivate(data as VendorPrivateRow);
}

// ---------------------------------------------------------------------------
// Admin KYC review
// ---------------------------------------------------------------------------

export interface VendorKycSubmission {
  ownerKey: string;
  displayName?: string;
  contactEmail?: string;
  countryCode?: string;
  isVerified: boolean;
  status: VerificationStatus;
  kyc?: KycInfo;
  documents: string[];
  note?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectReason?: string;
}

/** All KYC submissions (optionally filtered by status) joined with profile info. */
export async function listVendorKyc(status?: VerificationStatus): Promise<VendorKycSubmission[]> {
  if (!isSupabaseConfigured()) return [];
  let query = getSupabaseAdmin()
    .from("vendor_private")
    .select("*")
    .order("verification_submitted_at", { ascending: false, nullsFirst: false });
  if (status) query = query.eq("verification_status", status);
  const { data, error } = await query;
  if (error) throw error;

  const rows = (data as VendorPrivateRow[]).filter((r) => r.verification_status !== "unverified");
  if (rows.length === 0) return [];

  const ownerKeys = rows.map((r) => r.owner_key);
  const { data: profiles } = await getSupabaseAdmin()
    .from("vendor_profiles")
    .select("owner_key, display_name, contact_email, country_code, is_verified")
    .in("owner_key", ownerKeys);
  const profileMap = new Map(
    ((profiles as Array<{
      owner_key: string;
      display_name: string | null;
      contact_email: string | null;
      country_code: string | null;
      is_verified: boolean;
    }>) ?? []).map((p) => [p.owner_key, p]),
  );

  return rows.map((r) => {
    const priv = rowToPrivate(r);
    const profile = profileMap.get(r.owner_key);
    return {
      ownerKey: r.owner_key,
      displayName: profile?.display_name ?? undefined,
      contactEmail: profile?.contact_email ?? undefined,
      countryCode: priv.kyc?.countryCode ?? profile?.country_code ?? undefined,
      isVerified: profile?.is_verified ?? false,
      status: priv.verificationStatus,
      kyc: priv.kyc,
      documents: priv.verification.documents,
      note: priv.verification.note,
      submittedAt: priv.verificationSubmittedAt,
      reviewedAt: priv.verificationReviewedAt,
      reviewedBy: priv.verificationReviewedBy,
      rejectReason: priv.verificationRejectReason,
    };
  });
}

/** Approve or reject a vendor's KYC. On approval the public profile is marked verified. */
export async function reviewVendorKyc(
  ownerKey: string,
  decision: "approved" | "rejected",
  reviewedBy: string,
  reason?: string,
): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("vendor_private")
    .update({
      verification_status: decision,
      verification_reviewed_at: new Date().toISOString(),
      verification_reviewed_by: reviewedBy,
      verification_reject_reason: decision === "rejected" ? reason ?? null : null,
      updated_at: new Date().toISOString(),
    })
    .eq("owner_key", ownerKey);
  if (error) throw error;

  // Reflect verified badge on the public profile (best-effort; profile may not exist yet).
  await getSupabaseAdmin()
    .from("vendor_profiles")
    .update({ is_verified: decision === "approved", updated_at: new Date().toISOString() })
    .eq("owner_key", ownerKey);

  // On KYC approval, auto-publish any listings still waiting in pending.
  if (decision === "approved") {
    try {
      const { supabasePublishPendingListings } = await import(
        "@/lib/supabase/store-listings"
      );
      await supabasePublishPendingListings(ownerKey);
    } catch (err) {
      console.error("[vendors] publish pending after KYC failed", err);
    }
  }
}

/** True when the vendor has passed KYC and may sell on the marketplace. */
export async function isVendorKycApproved(ownerKey: string): Promise<boolean> {
  const priv = await getVendorPrivate(ownerKey);
  return priv?.verificationStatus === "approved";
}

export interface VendorProfileInput {
  ownerKey: string;
  displayName: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  brandImageUrl?: string;
  galleryUrls?: string[];
  location?: string;
  countryCode?: string;
  specialties?: string[];
  contactEmail?: string;
  contactPhone?: string;
  lineId?: string;
  website?: string;
  socials?: string[];
  yearsExperience?: number;
  isPublished?: boolean;
}

/** Upsert a vendor profile (auto-publishes into the /draftsmen directory). */
export async function upsertVendorProfile(input: VendorProfileInput): Promise<VendorProfile> {
  const { data, error } = await getSupabaseAdmin()
    .from("vendor_profiles")
    .upsert(
      {
        owner_key: input.ownerKey,
        display_name: input.displayName,
        headline: input.headline ?? null,
        bio: input.bio ?? null,
        avatar_url: input.avatarUrl ?? null,
        cover_url: input.coverUrl ?? null,
        brand_image_url: input.brandImageUrl ?? null,
        gallery_urls: input.galleryUrls ?? [],
        location: input.location ?? null,
        country_code: input.countryCode ?? null,
        specialties: input.specialties ?? [],
        contact_email: input.contactEmail ?? null,
        contact_phone: input.contactPhone ?? null,
        line_id: input.lineId ?? null,
        website: input.website ?? null,
        socials: input.socials ?? [],
        years_experience: input.yearsExperience ?? null,
        is_published: input.isPublished ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "owner_key" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return rowToVendor(data as VendorRow);
}
