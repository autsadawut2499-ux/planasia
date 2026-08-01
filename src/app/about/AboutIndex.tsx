"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { useBilingual } from "@/components/landing/useBilingual";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import {
  customerServiceTopicCatalog,
  type CustomerServiceTopicCatalogItem,
} from "@/lib/content/customer-service";

export function AboutIndex() {
  const L = useBilingual();
  const siteConfig = useSiteConfigOptional();
  const [topics, setTopics] = useState<CustomerServiceTopicCatalogItem[]>(() =>
    customerServiceTopicCatalog(siteConfig?.customerServiceArticles),
  );

  useEffect(() => {
    setTopics(customerServiceTopicCatalog(siteConfig?.customerServiceArticles));
  }, [siteConfig?.customerServiceArticles]);

  return (
    <div className="page-canvas">
      <LandingHeader />
      <main className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
        <h1 className="text-3xl font-bold text-[#1e3a5f] md:text-4xl">
          {L("Customer Service", "บริการลูกค้า")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
          {L(
            "Warranty, site adaptation, budgets, languages, terms, and international standards.",
            "การรับประกัน การปรับใช้พื้นที่พิเศษ งบประมาณก่อสร้าง ภาษา เงื่อนไข และมาตรฐานสากล",
          )}
        </p>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 sm:gap-6">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={topic.href}
              className="group card-surface rounded-2xl border p-7 transition-shadow hover:shadow-md"
            >
              <h2 className="flex items-center justify-between text-lg font-semibold text-[#2b3a4a] group-hover:text-[#1e40af]">
                {L(topic.titleEn, topic.titleTh)}
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </h2>
              <p className="mt-1.5 text-sm text-text-muted">
                {L(topic.summaryEn, topic.summaryTh)}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
