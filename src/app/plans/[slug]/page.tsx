import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { HousePlanCard } from "@/components/store/HousePlanCard";
import { buildBreadcrumbJsonLd, buildFaqJsonLd, buildItemListJsonLd } from "@/lib/seo/json-ld";
import { getSiteUrl } from "@/lib/seo/site-url";
import { filterListingsBySpec, getAllPlanPresets } from "@/lib/seo/programmatic";
import { resolvePlanPage } from "@/lib/seo/plan-content";
import { getListings } from "@/lib/store/db";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamicParams = true;

/**
 * Programmatic landing pages fetch the full catalogue at runtime rather than
 * prerendering it, because the listing payload is too large for static export.
 */
export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  // Avoid prerendering dozens of SEO pages when Supabase env is not set yet (bootstrap deploy).
  if (!isSupabaseConfigured()) return [];
  return getAllPlanPresets().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = resolvePlanPage(slug);
  if (!page) return { title: "House Plans | Planasia" };
  const canonical = `${getSiteUrl()}/plans/${page.slug}`;
  return {
    title: `${page.titleTh} | Planasia`,
    description: page.descriptionTh,
    alternates: {
      canonical,
      languages: { "th-TH": canonical, "en-US": `${canonical}?lang=en`, "x-default": canonical },
    },
    openGraph: {
      type: "website",
      locale: "th_TH",
      url: canonical,
      title: page.titleTh,
      description: page.descriptionTh,
    },
  };
}

export default async function PlanLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = resolvePlanPage(slug);
  if (!page) notFound();

  const all = isSupabaseConfigured() ? await getListings() : [];
  const listings = filterListingsBySpec(all, page.filter);

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "หน้าแรก", path: "/" },
    { name: "แบบบ้าน", path: "/store" },
    { name: page.titleTh, path: `/plans/${page.slug}` },
  ]);

  return (
    <div className="page-canvas">
      <JsonLd data={buildItemListJsonLd(listings, `/plans/${page.slug}`)} />
      <JsonLd data={breadcrumb} />
      <JsonLd data={buildFaqJsonLd(page.faqs)} />
      <LandingHeader />
      <main>
        <section className="border-b border-border/70 bg-surface-raised/60 py-12 md:py-14">
          <div className="section-inner">
            <nav className="mb-4 text-xs text-text-muted" aria-label="breadcrumb">
              <Link href="/" className="hover:text-[#1e40af]">
                หน้าแรก
              </Link>
              {" › "}
              <Link href="/store" className="hover:text-[#1e40af]">
                แบบบ้าน
              </Link>
              {" › "}
              <span className="text-text-secondary">{page.titleTh}</span>
            </nav>
            <h1 className="text-2xl font-bold text-[#1e3a5f] md:text-3xl">{page.titleTh}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{page.descriptionTh}</p>
            <p className="mt-4 text-sm font-semibold text-text-primary">
              {listings.length} แบบ
            </p>
          </div>
        </section>

        <section className="section-inner py-12 md:py-16">
          <h2 className="mb-7 text-lg font-bold text-[#1e3a5f]">{page.h2}</h2>
          {listings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-[var(--color-card,#fff)] py-20 text-center">
              <p className="text-text-muted">
                ยังไม่มีแบบบ้านในหมวดนี้ — ดู
                <Link href="/store" className="mx-1 text-[#1e40af] underline">
                  แบบบ้านทั้งหมด
                </Link>
              </p>
            </div>
          ) : (
            <div className="store-card-grid">
              {listings.map((listing, index) => (
                <div key={listing.id} className="min-w-0">
                  <HousePlanCard item={listing} index={index} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 rounded-xl border border-border bg-surface-raised/80 p-7 md:p-8">
            <h2 className="text-base font-bold text-text-primary">เกี่ยวกับ{page.titleTh}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {page.longDescriptionTh} เลือกชมแบบบ้านเพิ่มเติมได้ที่{" "}
              <Link href="/store" className="text-[#1e40af] underline">
                ร้านแบบบ้าน
              </Link>
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-border bg-[var(--color-card,#fff)] p-7 md:p-8">
            <h2 className="text-base font-bold text-text-primary">คำถามที่พบบ่อย</h2>
            <dl className="mt-5 divide-y divide-border">
              {page.faqs.map((faq) => (
                <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
                  <dt className="text-sm font-semibold text-text-primary">{faq.question}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-text-secondary">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </div>
  );
}
