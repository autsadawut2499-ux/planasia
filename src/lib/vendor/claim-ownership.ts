import "server-only";

import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * When a draftsman signs in with Google, move rows keyed by their prior
 * browser id onto the stable OAuth subject so uploads are not orphaned.
 */
export async function claimVendorOwnershipFromBrowser(
  sessionUserId: string,
  browserId: string | undefined,
): Promise<{ claimed: boolean }> {
  if (!isSupabaseConfigured()) return { claimed: false };
  const session = sessionUserId.trim();
  const browser = browserId?.trim();
  if (!session || !browser || session === browser) return { claimed: false };

  const db = getSupabaseAdmin();

  // Listings always move to the signed-in owner.
  await db.from("store_listings").update({ owner_id: session }).eq("owner_id", browser);

  // Profiles / private: only if the session key does not already exist.
  const existingProfile = await db
    .from("vendor_profiles")
    .select("owner_key")
    .eq("owner_key", session)
    .maybeSingle();
  if (!existingProfile.data) {
    await db.from("vendor_profiles").update({ owner_key: session }).eq("owner_key", browser);
  }

  const existingPrivate = await db
    .from("vendor_private")
    .select("owner_key")
    .eq("owner_key", session)
    .maybeSingle();
  if (!existingPrivate.data) {
    await db.from("vendor_private").update({ owner_key: session }).eq("owner_key", browser);
  }

  try {
    await db.from("vendor_earnings").update({ owner_key: session }).eq("owner_key", browser);
  } catch {
    /* table may not exist in older envs */
  }

  try {
    await db.from("push_subscriptions").update({ owner_key: session }).eq("owner_key", browser);
  } catch {
    /* optional */
  }

  return { claimed: true };
}
