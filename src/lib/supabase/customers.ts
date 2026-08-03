import "server-only";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export interface CustomerRecord {
  id: string;
  email: string;
  name?: string;
  imageUrl?: string;
  lastLoginAt: string;
  createdAt: string;
}

/**
 * Upsert a buyer account from Google Login (NextAuth).
 * Keyed by Google subject id so re-login reconnects the same customer.
 */
export async function upsertCustomerFromGoogle(input: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<CustomerRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const id = input.id.trim();
  const email = input.email.trim().toLowerCase();
  if (!id || !email) return null;

  const now = new Date().toISOString();
  const row = {
    id,
    email,
    name: input.name?.trim() || null,
    image_url: input.image?.trim() || null,
    last_login_at: now,
    updated_at: now,
  };

  const { data, error } = await getSupabaseAdmin()
    .from("customers")
    .upsert(row, { onConflict: "id" })
    .select("id, email, name, image_url, last_login_at, created_at")
    .maybeSingle();

  if (error) {
    console.error("[customers] upsert failed", error.message);
    return null;
  }
  if (!data) return null;
  return {
    id: data.id as string,
    email: data.email as string,
    name: (data.name as string | null) ?? undefined,
    imageUrl: (data.image_url as string | null) ?? undefined,
    lastLoginAt: data.last_login_at as string,
    createdAt: data.created_at as string,
  };
}
