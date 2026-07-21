"use client";



import Link from "next/link";

import { ArrowRight, Menu, Store, Tags } from "lucide-react";

import { useState } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";

import { NavIconLink } from "@/components/layout/NavIconLink";

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

      <div className="flex h-14 items-center gap-3 pl-2 pr-3 md:gap-4 md:pl-3 md:pr-5 lg:pr-6">

        <BrandLogo variant="dark" />



        <nav className="hidden items-center gap-2 md:flex lg:gap-3">

          <NavIconLink href="/store" label={translate("nav.store")} icon={Store} variant="dark" />

          <NavIconLink href="#pricing" label={translate("nav.pricing")} icon={Tags} variant="dark" />

          <a

            href="#how-it-works"

            className="rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white"

          >

            {translate("nav.howItWorks")}

          </a>

        </nav>



        <div className="ml-auto flex items-center gap-2">

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

