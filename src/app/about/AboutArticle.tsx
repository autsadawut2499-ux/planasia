"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { RichText } from "@/components/content/RichText";
import { useBilingual } from "@/components/landing/useBilingual";
import { DEFAULT_CUSTOMER_SERVICE_ARTICLES } from "@/lib/content/customer-service";

/** Public Customer Service article — static content from ABOUT_PAGES. */
export function AboutArticle({ slug }: { slug: string }) {
  const L = useBilingual();
  const article = DEFAULT_CUSTOMER_SERVICE_ARTICLES[slug] ?? null;

  if (!article) {
    return (
      <div className="page-canvas">
        <LandingHeader />
        <main className="mx-auto max-w-3xl px-5 py-20 text-center text-text-muted">
          {L("Article not found", "ไม่พบบทความ")}
        </main>
      </div>
    );
  }

  const title = L(article.title.en, article.title.th);
  const summary = L(article.summary.en, article.summary.th);
  const body = L(article.body.en, article.body.th);

  return (
    <div className="page-canvas">
      <LandingHeader />
      <main className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
          <Link href="/" className="hover:text-[#1e40af]">
            {L("Home", "หน้าแรก")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/about" className="hover:text-[#1e40af]">
            {L("Customer Service", "บริการลูกค้า")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-text-secondary">{title}</span>
        </nav>

        <article>
          <h1 className="text-3xl font-bold text-[#1e3a5f] md:text-4xl">{title}</h1>
          {summary && (
            <p className="mt-4 text-lg leading-relaxed text-text-secondary">{summary}</p>
          )}
          <div className="mt-10">
            <RichText html={body} />
          </div>
        </article>

        <div className="mt-12 rounded-2xl border border-border bg-surface-raised/80 p-6 text-center md:p-8">
          <p className="text-text-secondary">
            {L("Ready to find your plan?", "พร้อมจะเลือกแบบบ้านของคุณแล้วหรือยัง?")}
          </p>
          <Link
            href="/store"
            className="mt-3 inline-block rounded-md bg-[#1e40af] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3a8a]"
          >
            {L("Browse House Plans", "ดูแบบบ้านทั้งหมด")}
          </Link>
        </div>
      </main>
    </div>
  );
}
