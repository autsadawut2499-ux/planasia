/**
 * Static Customer Service /about topics — sourced from ABOUT_PAGES.
 * Admin CMS for these pages has been removed.
 */

import { ABOUT_PAGES, type AboutPage, type Bilingual } from "@/lib/content/about";

export interface CustomerServiceArticle {
  slug: string;
  title: Bilingual;
  summary: Bilingual;
  /** Plain-text body derived from about sections. */
  body: Bilingual;
}

export type CustomerServiceArticlesMap = Record<string, CustomerServiceArticle>;

function sectionsToBody(page: AboutPage): Bilingual {
  const en = page.sections.map((s) => `${s.heading.en}\n\n${s.body.en}`).join("\n\n");
  const th = page.sections.map((s) => `${s.heading.th}\n\n${s.body.th}`).join("\n\n");
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

export const DEFAULT_CUSTOMER_SERVICE_ARTICLES: CustomerServiceArticlesMap = Object.fromEntries(
  ABOUT_PAGES.map((p) => [p.slug, aboutPageToArticle(p)]),
);

export interface CustomerServiceTopicCatalogItem {
  slug: string;
  titleTh: string;
  titleEn: string;
  summaryTh: string;
  summaryEn: string;
  href: string;
}

/** Catalog of Customer Service topics for the public /about index. */
export function customerServiceTopicCatalog(): CustomerServiceTopicCatalogItem[] {
  return CUSTOMER_SERVICE_SLUGS.map((slug) => {
    const article = DEFAULT_CUSTOMER_SERVICE_ARTICLES[slug]!;
    return {
      slug,
      titleTh: article.title.th,
      titleEn: article.title.en,
      summaryTh: article.summary.th,
      summaryEn: article.summary.en,
      href: `/about/${slug}`,
    };
  });
}
