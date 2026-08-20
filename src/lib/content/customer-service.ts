/**
 * Customer Service articles (บริการลูกค้า) — 9 text-only CMS pages.
 * Stored in site_settings under key `customer_service_articles`.
 */

import { ABOUT_PAGES, type AboutPage, type Bilingual } from "@/lib/content/about";

export const CUSTOMER_SERVICE_SETTINGS_KEY = "customer_service_articles";

export interface CustomerServiceArticle {
  slug: string;
  title: Bilingual;
  summary: Bilingual;
  /** Article body — HTML from TipTap (legacy plain text still supported). */
  body: Bilingual;
}

export type CustomerServiceArticlesMap = Record<string, CustomerServiceArticle>;

function sectionsToBody(page: AboutPage): Bilingual {
  const en = page.sections
    .map((s) => `${s.heading.en}\n\n${s.body.en}`)
    .join("\n\n");
  const th = page.sections
    .map((s) => `${s.heading.th}\n\n${s.body.th}`)
    .join("\n\n");
  return { en, th };
}

export function aboutPageToArticle(page: AboutPage): CustomerServiceArticle {
  return {
    slug: page.slug,
    title: { ...page.title },
    summary: { ...page.summary },
    body: sectionsToBody(page),
  };
}

export const CUSTOMER_SERVICE_SLUGS = ABOUT_PAGES.map((p) => p.slug);

export const DEFAULT_CUSTOMER_SERVICE_ARTICLES: CustomerServiceArticlesMap =
  Object.fromEntries(ABOUT_PAGES.map((p) => [p.slug, aboutPageToArticle(p)]));

export function normalizeCustomerServiceArticle(
  slug: string,
  raw: Partial<CustomerServiceArticle> | null | undefined,
): CustomerServiceArticle {
  const fallback =
    DEFAULT_CUSTOMER_SERVICE_ARTICLES[slug] ??
    aboutPageToArticle(
      ABOUT_PAGES[0] ?? {
        slug,
        title: { en: slug, th: slug },
        summary: { en: "", th: "" },
        sections: [],
      },
    );

  return {
    slug,
    title: {
      en: raw?.title?.en?.trim() || fallback.title.en,
      th: raw?.title?.th?.trim() || fallback.title.th,
    },
    summary: {
      en: raw?.summary?.en?.trim() || fallback.summary.en,
      th: raw?.summary?.th?.trim() || fallback.summary.th,
    },
    body: {
      en: raw?.body?.en?.trim() || fallback.body.en,
      th: raw?.body?.th?.trim() || fallback.body.th,
    },
  };
}

export function normalizeCustomerServiceArticles(
  raw: CustomerServiceArticlesMap | null | undefined,
): CustomerServiceArticlesMap {
  const out: CustomerServiceArticlesMap = {};
  for (const slug of CUSTOMER_SERVICE_SLUGS) {
    out[slug] = normalizeCustomerServiceArticle(slug, raw?.[slug]);
  }
  return out;
}

export interface CustomerServiceTopicCatalogItem {
  slug: string;
  titleTh: string;
  titleEn: string;
  summaryTh: string;
  summaryEn: string;
  /** Public frontend route */
  href: string;
  /** Admin text editor route */
  adminHref: string;
}

/**
 * Full catalog of the 9 Customer Service dropdown topics —
 * merged with CMS titles/summaries when provided.
 */
export function customerServiceTopicCatalog(
  articles?: CustomerServiceArticlesMap | null,
): CustomerServiceTopicCatalogItem[] {
  return CUSTOMER_SERVICE_SLUGS.map((slug) => {
    const article =
      (articles?.[slug] && normalizeCustomerServiceArticle(slug, articles[slug])) ||
      DEFAULT_CUSTOMER_SERVICE_ARTICLES[slug]!;
    return {
      slug,
      titleTh: article.title.th,
      titleEn: article.title.en,
      summaryTh: article.summary.th,
      summaryEn: article.summary.en,
      href: `/about/${slug}`,
      adminHref: `/admin/customer-service/${slug}`,
    };
  });
}
