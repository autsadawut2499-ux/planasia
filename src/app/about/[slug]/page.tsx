import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutArticle } from "../AboutArticle";
import { ABOUT_PAGES, getAboutPage } from "@/lib/content/about";
import { CUSTOMER_SERVICE_SLUGS } from "@/lib/content/customer-service";
import { buildAboutMetadata } from "@/lib/seo/metadata";
import { loadCustomerServiceArticle } from "@/lib/supabase/customer-service";

export function generateStaticParams() {
  return ABOUT_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!CUSTOMER_SERVICE_SLUGS.includes(slug)) return {};

  const cms = await loadCustomerServiceArticle(slug);
  const fallback = getAboutPage(slug);
  if (!cms && !fallback) return {};

  return buildAboutMetadata({
    slug,
    title: cms?.title ?? fallback!.title,
    summary: cms?.summary ?? fallback!.summary,
    sections: fallback?.sections ?? [],
  });
}

export default async function AboutSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!CUSTOMER_SERVICE_SLUGS.includes(slug)) notFound();
  return <AboutArticle slug={slug} />;
}
