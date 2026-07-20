"use client";

import Link from "next/link";
import { ArrowRight, Menu, Sparkles } from "lucide-react";
import { useState } from "react";
import { MobileNavDrawer } from "@/components/ui/MobileNavDrawer";
import { useApp } from "@/context/AppContext";

export function LandingHeader() {
  const { translate } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "#gallery", label: translate("gallery.title"), anchor: true },
    { href: "#how-it-works", label: translate("nav.howItWorks"), anchor: true },
    { href: "#pricing", label: translate("nav.pricing"), anchor: true },
    { href: "/store", label: translate("nav.store") },
    { href: "/workspace", label: translate("nav.startDesign") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Planasia</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#gallery" className="text-sm text-white/70 transition-colors hover:text-white">
            {translate("gallery.title")}
          </a>
          <a href="#how-it-works" className="text-sm text-white/70 transition-colors hover:text-white">
            {translate("nav.howItWorks")}
          </a>
          <a href="#pricing" className="text-sm text-white/70 transition-colors hover:text-white">
            {translate("nav.pricing")}
          </a>
          <Link href="/store" className="text-sm text-white/70 transition-colors hover:text-white">
            {translate("nav.store")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
            aria-label={translate("nav.menu")}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/workspace"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-indigo-700 transition-all hover:bg-indigo-50 sm:px-4"
          >
            <span className="hidden sm:inline">{translate("hero.cta")}</span>
            <span className="sm:hidden">{translate("nav.startDesign")}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={navLinks}
        variant="dark"
      />
    </header>
  );
}
