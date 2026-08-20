import "server-only";
import { createRandomId } from "@/lib/random-id";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  excerptFromContent,
  slugifyArticleTitle,
  type Article,
  type ArticleInput,
} from "@/lib/content/articles";

interface ArticleRow {
  id: string;
  slug: string;
  title: string;
  content: string;
  featured_image_url: string | null;
  excerpt: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

function mapRow(row: ArticleRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    content: row.content ?? "",
    featuredImageUrl: row.featured_image_url?.trim() || undefined,
    excerpt: row.excerpt?.trim() || undefined,
    isPublished: Boolean(row.is_published),
    publishedAt: row.published_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by ?? undefined,
  };
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const sb = getSupabaseAdmin();
  if (!sb) return base;
  let candidate = base;
  for (let i = 0; i < 20; i++) {
    let q = sb.from("articles").select("id").eq("slug", candidate).limit(1);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i + 2}`;
  }
  return `${base}-${createRandomId().slice(0, 6)}`;
}

export async function listArticles(opts?: {
  publishedOnly?: boolean;
}): Promise<Article[]> {
  if (!isSupabaseConfigured()) return [];
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  let q = sb.from("articles").select("*");
  if (opts?.publishedOnly) {
    q = q
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false });
  } else {
    q = q.order("updated_at", { ascending: false });
  }

  const { data, error } = await q;
  if (error) {
    console.error("[articles] list failed", error.message);
    return [];
  }
  return (data as ArticleRow[]).map(mapRow);
}

export async function getArticleBySlug(
  slug: string,
  opts?: { publishedOnly?: boolean },
): Promise<Article | null> {
  if (!slug.trim() || !isSupabaseConfigured()) return null;
  const sb = getSupabaseAdmin();
  if (!sb) return null;

  let q = sb.from("articles").select("*").eq("slug", slug.trim()).limit(1);
  if (opts?.publishedOnly) q = q.eq("is_published", true);

  const { data, error } = await q.maybeSingle();
  if (error || !data) return null;
  return mapRow(data as ArticleRow);
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (!id.trim() || !isSupabaseConfigured()) return null;
  const sb = getSupabaseAdmin();
  if (!sb) return null;

  const { data, error } = await sb.from("articles").select("*").eq("id", id.trim()).maybeSingle();
  if (error || !data) return null;
  return mapRow(data as ArticleRow);
}

export async function createArticle(
  input: ArticleInput,
  updatedBy?: string,
): Promise<Article> {
  if (!isSupabaseConfigured()) throw new Error("Database is not configured");
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Database is not configured");

  const title = input.title.trim();
  if (!title) throw new Error("กรุณากรอกชื่อบทความ");

  const content = String(input.content ?? "").trim();
  const slugBase = slugifyArticleTitle(input.slug?.trim() || title);
  const slug = await ensureUniqueSlug(slugBase);
  const isPublished = input.isPublished !== false;
  const now = new Date().toISOString();
  const featured = input.featuredImageUrl?.trim() || null;
  const excerpt =
    input.excerpt?.trim() || (content ? excerptFromContent(content) : null);

  const row = {
    id: createRandomId(),
    slug,
    title,
    content,
    featured_image_url: featured,
    excerpt,
    is_published: isPublished,
    published_at: isPublished ? now : null,
    created_at: now,
    updated_at: now,
    updated_by: updatedBy ?? null,
  };

  const { data, error } = await sb.from("articles").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return mapRow(data as ArticleRow);
}

export async function updateArticle(
  id: string,
  input: ArticleInput,
  updatedBy?: string,
): Promise<Article> {
  if (!isSupabaseConfigured()) throw new Error("Database is not configured");
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Database is not configured");

  const existing = await getArticleById(id);
  if (!existing) throw new Error("ไม่พบบทความ");

  const title = input.title.trim();
  if (!title) throw new Error("กรุณากรอกชื่อบทความ");

  const content = String(input.content ?? "").trim();
  const slugBase = slugifyArticleTitle(input.slug?.trim() || title);
  const slug = await ensureUniqueSlug(slugBase, id);
  const isPublished = input.isPublished !== false;
  const featured =
    input.featuredImageUrl === undefined
      ? existing.featuredImageUrl || null
      : input.featuredImageUrl?.trim() || null;
  const excerpt =
    input.excerpt?.trim() ||
    (content ? excerptFromContent(content) : existing.excerpt) ||
    null;

  const patch = {
    slug,
    title,
    content,
    featured_image_url: featured,
    excerpt,
    is_published: isPublished,
    published_at: isPublished
      ? existing.publishedAt || new Date().toISOString()
      : null,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy ?? null,
  };

  const { data, error } = await sb
    .from("articles")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return mapRow(data as ArticleRow);
}

export async function deleteArticle(id: string): Promise<void> {
  if (!isSupabaseConfigured()) throw new Error("Database is not configured");
  const sb = getSupabaseAdmin();
  if (!sb) throw new Error("Database is not configured");

  const { error } = await sb.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
