"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function Hero() {
  const { translate } = useApp();

  return (
    <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden bg-[#0a0a0f]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/60 via-[#0a0a0f]/80 to-[#0a0a0f]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15)_0%,transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-indigo-200 backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          AI Architectural Design Platform
        </div>
        <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
          {translate("hero.title")}
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-white/70 md:text-xl">
          {translate("hero.subtitle")}
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40"
          >
            {translate("hero.cta")}
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-base font-medium text-white/90 transition-colors hover:bg-white/5"
          >
            {translate("nav.howItWorks")}
          </a>
        </div>
      </div>
    </section>
  );
}
