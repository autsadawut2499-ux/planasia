"use client";



import Link from "next/link";

import { Globe, Languages, LogIn, LogOut, Store, Tags } from "lucide-react";

import { signIn, signOut, useSession } from "next-auth/react";

import { BrandLogo } from "@/components/layout/BrandLogo";

import { NavIconLink } from "@/components/layout/NavIconLink";

import { useApp, COUNTRIES, LOCALE_LABELS, type Locale } from "@/context/AppContext";



interface HeaderProps {

  variant?: "landing" | "workspace";

}



export function Header({ variant = "landing" }: HeaderProps) {

  const { locale, setLocale, country, setCountryCode, translate } = useApp();

  const { data: session, status } = useSession();



  return (

    <header className={`sticky top-0 z-50 border-b border-white/8 backdrop-blur-xl ${variant === "workspace" ? "bg-[#0a0a0c]/90" : "bg-surface/70"}`}>
      <div className={`flex items-center gap-3 pl-2 pr-3 md:gap-4 md:pl-3 md:pr-5 lg:pr-6 ${variant === "workspace" ? "h-12" : "h-14"}`}>

        <BrandLogo variant="workspace" />



        <nav className="hidden items-center gap-2 md:flex lg:gap-3">

          <NavIconLink

            href="/store"

            label={translate("nav.store")}

            icon={Store}

            variant="dark"

          />

          <NavIconLink

            href="/#pricing"

            label={translate("nav.pricing")}

            icon={Tags}

            variant="dark"

          />

          {variant === "landing" && (

            <Link

              href="/#how-it-works"

              className="rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5 hover:text-white"

            >

              {translate("nav.howItWorks")}

            </Link>

          )}

        </nav>



        <div className="ml-auto flex items-center gap-2 md:gap-3">

          <div className="hidden items-center gap-2 sm:flex">

            <div className="relative">

              <Globe className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />

              <select

                aria-label={translate("country.select")}

                value={country.code}

                onChange={(e) => setCountryCode(e.target.value)}

                className="dropdown-select h-9 w-[130px] pl-8 text-xs"

              >

                {COUNTRIES.map((c) => (

                  <option key={c.code} value={c.code}>

                    {c.name[locale]}

                  </option>

                ))}

              </select>

            </div>



            <div className="relative">

              <Languages className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />

              <select

                aria-label={translate("language.select")}

                value={locale}

                onChange={(e) => setLocale(e.target.value as Locale)}

                className="dropdown-select h-9 w-[110px] pl-8 text-xs"

              >

                {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (

                  <option key={loc} value={loc}>

                    {LOCALE_LABELS[loc]}

                  </option>

                ))}

              </select>

            </div>

          </div>



          <Link href="/workspace" className="btn-primary hidden text-sm sm:inline-flex">

            {translate("nav.startDesign")}

          </Link>



          {status === "authenticated" && session?.user ? (

            <button

              type="button"

              onClick={() => signOut()}

              className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 backdrop-blur-sm transition-colors hover:bg-white/10"

              title={session.user.email ?? undefined}

            >

              {session.user.image ? (

                // eslint-disable-next-line @next/next/no-img-element

                <img src={session.user.image} alt="" className="h-6 w-6 rounded-full ring-1 ring-white/20" />

              ) : (

                <span className="text-xs font-medium text-text-secondary">

                  {session.user.name?.[0] ?? "U"}

                </span>

              )}

              <LogOut className="hidden h-3.5 w-3.5 text-text-muted sm:block" />

            </button>

          ) : (

            <button

              type="button"

              onClick={() => signIn("google")}

              className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-medium text-text-secondary backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"

            >

              <LogIn className="h-3.5 w-3.5" />

              <span className="hidden sm:inline">{translate("nav.login")}</span>

            </button>

          )}

        </div>

      </div>

    </header>

  );

}

