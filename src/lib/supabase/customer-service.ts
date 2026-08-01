import {
  CUSTOMER_SERVICE_SETTINGS_KEY,
  DEFAULT_CUSTOMER_SERVICE_ARTICLES,
  normalizeCustomerServiceArticle,
  normalizeCustomerServiceArticles,
  type CustomerServiceArticle,
  type CustomerServiceArticlesMap,
} from "@/lib/content/customer-service";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";

export async function loadCustomerServiceArticles(): Promise<CustomerServiceArticlesMap> {
  if (!isSupabaseConfigured()) {
    return { ...DEFAULT_CUSTOMER_SERVICE_ARTICLES };
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("site_settings")
      .select("value")
      .eq("key", CUSTOMER_SERVICE_SETTINGS_KEY)
      .maybeSingle();

    if (error || !data?.value) {
      return { ...DEFAULT_CUSTOMER_SERVICE_ARTICLES };
    }
    return normalizeCustomerServiceArticles(data.value as CustomerServiceArticlesMap);
  } catch {
    return { ...DEFAULT_CUSTOMER_SERVICE_ARTICLES };
  }
}

export async function loadCustomerServiceArticle(
  slug: string,
): Promise<CustomerServiceArticle | null> {
  const all = await loadCustomerServiceArticles();
  return all[slug] ?? null;
}

export async function saveCustomerServiceArticle(
  slug: string,
  article: CustomerServiceArticle,
  updatedBy: string,
): Promise<CustomerServiceArticle> {
  const normalized = normalizeCustomerServiceArticle(slug, article);
  const current = await loadCustomerServiceArticles();
  const next = { ...current, [slug]: normalized };

  const { error } = await getSupabaseAdmin()
    .from("site_settings")
    .upsert(
      {
        key: CUSTOMER_SERVICE_SETTINGS_KEY,
        value: next,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy,
      },
      { onConflict: "key" },
    );
  if (error) throw error;
  return normalized;
}
