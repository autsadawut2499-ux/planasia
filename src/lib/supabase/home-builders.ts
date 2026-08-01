import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEMO_HOME_BUILDERS } from "@/lib/home-building/demo";
import type {
  HomeBuilder,
  HomeBuilderRegistrationInput,
  HomeBuilderStatus,
} from "@/lib/home-building/types";
import { MAX_PORTFOLIO_IMAGES } from "@/lib/home-building/types";

export { DEMO_HOME_BUILDERS } from "@/lib/home-building/demo";

interface HomeBuilderRow {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  line_id: string;
  service_areas: string;
  years_experience: number;
  expertise: string;
  logo_url: string | null;
  portfolio_urls: string[] | null;
  company_certificate_url: string | null;
  verification_document_url: string | null;
  privacy_accepted: boolean;
  terms_accepted: boolean;
  status: HomeBuilderStatus;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

function mapRow(row: HomeBuilderRow): HomeBuilder {
  return {
    id: row.id,
    companyName: row.company_name,
    contactPerson: row.contact_person,
    phone: row.phone,
    email: row.email,
    lineId: row.line_id,
    serviceAreas: row.service_areas,
    yearsExperience: row.years_experience,
    expertise: row.expertise,
    logoUrl: row.logo_url,
    portfolioUrls: Array.isArray(row.portfolio_urls) ? row.portfolio_urls.filter(Boolean) : [],
    companyCertificateUrl: row.company_certificate_url,
    verificationDocumentUrl: row.verification_document_url,
    privacyAccepted: row.privacy_accepted,
    termsAccepted: row.terms_accepted,
    status: row.status,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPublishedHomeBuilders(): Promise<HomeBuilder[]> {
  if (!isSupabaseConfigured()) return DEMO_HOME_BUILDERS;

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("home_builders")
      .select("*")
      .eq("is_published", true)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;
    const rows = (data as HomeBuilderRow[] | null) ?? [];
    if (rows.length === 0) return DEMO_HOME_BUILDERS;
    return rows.map(mapRow);
  } catch {
    return DEMO_HOME_BUILDERS;
  }
}

export async function listAllHomeBuilders(): Promise<HomeBuilder[]> {
  if (!isSupabaseConfigured()) return DEMO_HOME_BUILDERS;

  const { data, error } = await getSupabaseAdmin()
    .from("home_builders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data as HomeBuilderRow[] | null) ?? []).map(mapRow);
}

export async function updateHomeBuilderModeration(
  id: string,
  patch: { status?: HomeBuilderStatus; isPublished?: boolean },
): Promise<HomeBuilder> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.status) updates.status = patch.status;
  if (typeof patch.isPublished === "boolean") updates.is_published = patch.isPublished;

  // Publishing implies approval.
  if (patch.isPublished === true && !patch.status) {
    updates.status = "approved";
  }
  if (patch.status === "rejected") {
    updates.is_published = false;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("home_builders")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as HomeBuilderRow);
}

export async function deleteHomeBuilder(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }
  const { error } = await getSupabaseAdmin().from("home_builders").delete().eq("id", id);
  if (error) throw error;
}

export async function createHomeBuilderRegistration(
  input: HomeBuilderRegistrationInput,
): Promise<HomeBuilder> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const portfolio = (input.portfolioUrls ?? [])
    .map((u) => u.trim())
    .filter(Boolean)
    .slice(0, MAX_PORTFOLIO_IMAGES);

  const { data, error } = await getSupabaseAdmin()
    .from("home_builders")
    .insert({
      company_name: input.companyName.trim(),
      contact_person: input.contactPerson.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      line_id: input.lineId.trim(),
      service_areas: input.serviceAreas.trim(),
      years_experience: Math.max(0, Math.min(100, Math.round(input.yearsExperience || 0))),
      expertise: (input.expertise ?? "").trim(),
      logo_url: input.logoUrl?.trim() || null,
      portfolio_urls: portfolio,
      company_certificate_url: input.companyCertificateUrl?.trim() || null,
      verification_document_url: input.verificationDocumentUrl?.trim() || null,
      privacy_accepted: Boolean(input.privacyAccepted),
      terms_accepted: Boolean(input.termsAccepted),
      status: "pending",
      is_published: false,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRow(data as HomeBuilderRow);
}
