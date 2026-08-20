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

/** Slug for article URLs — keeps Thai letters when present. */
export function slugifyArticleTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0e00-\u0e7f]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || `article-${Date.now().toString(36)}`;
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
