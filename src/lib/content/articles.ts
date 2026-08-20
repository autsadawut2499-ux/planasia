/** Blog / articles CMS types. */

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  featuredImageUrl?: string;
  excerpt?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface ArticleInput {
  title: string;
  content: string;
  featuredImageUrl?: string | null;
  excerpt?: string | null;
  isPublished?: boolean;
  slug?: string;
}

/**
 * Max percent-encoded slug length for filesystem-safe Next.js prerender paths.
 * Thai code points expand ~9x via encodeURIComponent; char-count caps alone
 * still blow Windows MAX_PATH / ENAMETOOLONG during static generation.
 */
export const ARTICLE_SLUG_MAX_ENCODED_LEN = 160;

/** Truncate so encodeURIComponent(slug) stays within ARTICLE_SLUG_MAX_ENCODED_LEN. */
export function truncateArticleSlug(slug: string, maxEncoded = ARTICLE_SLUG_MAX_ENCODED_LEN): string {
  let out = "";
  for (const ch of slug) {
    const trial = out + ch;
    if (encodeURIComponent(trial).length > maxEncoded) break;
    out = trial;
  }
  return out.replace(/-+$/g, "");
}

/** Slug for article URLs — keeps Thai letters when present. */
export function slugifyArticleTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0e00-\u0e7f]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  const truncated = truncateArticleSlug(base);
  return truncated || `article-${Date.now().toString(36)}`;
}

export function excerptFromContent(content: string, max = 160): string {
  const plain = content
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trim()}…`;
}
