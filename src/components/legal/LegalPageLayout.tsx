"use client";

import Link from "next/link";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { useApp } from "@/context/AppContext";
import type { LegalDocument } from "@/lib/legal/content";

interface LegalPageLayoutProps {
  document: LegalDocument;
}

export function LegalPageLayout({ document }: LegalPageLayoutProps) {
  const { translate } = useApp();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-text-primary">
      <LandingHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-sm text-text-muted hover:text-white">
          ← Planasia
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-white">{document.title}</h1>
        <p className="mt-2 text-sm text-text-muted">{translate("legal.lastUpdated")}</p>

        <div className="mt-10 space-y-8">
          {document.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-white">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{section.body}</p>
            </section>
          ))}
        </div>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-4 px-6 text-sm text-text-muted">
          <Link href="/privacy" className="hover:text-white">
            {translate("footer.privacy")}
          </Link>
          <Link href="/terms" className="hover:text-white">
            {translate("footer.terms")}
          </Link>
          <span>
            {translate("footer.contact")}: hello@planasia.com
          </span>
        </div>
      </footer>
    </div>
  );
}
