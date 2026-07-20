"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { StyleGallery } from "@/components/landing/StyleGallery";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Pricing } from "@/components/landing/Pricing";
import { useApp } from "@/context/AppContext";

export default function HomePageClient() {
  const { translate } = useApp();

  return (
    <div className="scroll-smooth">
      <LandingHeader />
      <main>
        <Hero />
        <StyleGallery />
        <HowItWorks />

        <section className="border-y border-border bg-gradient-to-r from-indigo-600 to-violet-700 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white md:text-3xl">
              {translate("landing.ctaBand")}
            </h2>
            <p className="mb-8 text-indigo-100">{translate("landing.ctaBandDesc")}</p>
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-indigo-700 shadow-lg transition-all hover:-translate-y-0.5"
            >
              {translate("hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <Pricing />
      </main>

      <footer className="border-t border-border bg-surface py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <span className="text-sm font-bold gradient-text">Planasia</span>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-text-muted">
            <Link href="/workspace">{translate("nav.startDesign")}</Link>
            <Link href="/store">{translate("nav.store")}</Link>
            <a href="#pricing">{translate("nav.pricing")}</a>
            <Link href="/privacy">{translate("footer.privacy")}</Link>
            <Link href="/terms">{translate("footer.terms")}</Link>
          </nav>
          <p className="text-sm text-text-muted">
            {translate("footer.contact")}: hello@planasia.com
          </p>
        </div>
      </footer>
    </div>
  );
}
