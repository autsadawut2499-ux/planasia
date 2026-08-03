import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export type InteractionEvent = "view" | "cart" | "wishlist" | "purchase" | "chat";

/** Relative importance of each signal when building a user-affinity profile. */
export const EVENT_WEIGHT: Record<InteractionEvent, number> = {
  view: 1,
  chat: 2,
  wishlist: 3,
  cart: 4,
  purchase: 6,
};

export interface StoreInteraction {
  id: string;
  listingId: string;
  viewerKey: string;
  sessionUserId?: string;
  browserId?: string;
  eventType: InteractionEvent;
  weight: number;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface InteractionRow {
  id: string;
  listing_id: string;
  viewer_key: string;
  session_user_id: string | null;
  browser_id: string | null;
  event_type: InteractionEvent;
  weight: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

function rowToInteraction(row: InteractionRow): StoreInteraction {
  return {
    id: row.id,
    listingId: row.listing_id,
    viewerKey: row.viewer_key,
    sessionUserId: row.session_user_id ?? undefined,
    browserId: row.browser_id ?? undefined,
    eventType: row.event_type,
    weight: Number(row.weight),
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

export interface RecordInteractionInput {
  listingId: string;
  viewerKey: string;
  sessionUserId?: string;
  browserId?: string;
  eventType: InteractionEvent;
  metadata?: Record<string, unknown>;
}

export async function recordInteraction(input: RecordInteractionInput): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await getSupabaseAdmin().from("store_interactions").insert({
    listing_id: input.listingId,
    viewer_key: input.viewerKey,
    session_user_id: input.sessionUserId ?? null,
    browser_id: input.browserId ?? null,
    event_type: input.eventType,
    weight: EVENT_WEIGHT[input.eventType] ?? 1,
    metadata: input.metadata ?? {},
  });
  if (error) throw error;
}

/** All interactions for one viewer (their behavioural history). */
export async function getInteractionsForViewer(
  viewerKey: string,
  limit = 500,
): Promise<StoreInteraction[]> {
  if (!isSupabaseConfigured() || !viewerKey) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("store_interactions")
    .select("*")
    .eq("viewer_key", viewerKey)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as InteractionRow[]).map(rowToInteraction);
}

/**
 * Recent interactions across all viewers, used to build the item-item
 * co-occurrence matrix for collaborative filtering.
 */
export async function getRecentInteractions(limit = 800): Promise<StoreInteraction[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("store_interactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as InteractionRow[]).map(rowToInteraction);
}

/** Global popularity counts per listing (used as a cold-start prior). */
export async function getListingPopularity(): Promise<Map<string, number>> {
  const interactions = await getRecentInteractions();
  const counts = new Map<string, number>();
  for (const it of interactions) {
    counts.set(it.listingId, (counts.get(it.listingId) ?? 0) + it.weight);
  }
  return counts;
}
