"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { MobileNavDrawer } from "@/components/ui/MobileNavDrawer";
import { useApp, COUNTRIES, LOCALE_LABELS, type Locale } from "@/context/AppContext";
import { useStoreBrowse } from "@/context/StoreBrowseContext";
import { useStoreCart } from "@/context/StoreCartContext";

export function StoreHeader() {
  const { locale, setLocale, country, setCountryCode, translate } = useApp();
  const { data: session, status } = useSession();
  const { itemCount, setDrawerOpen } = useStoreCart();
  const { searchQuery, setSearchQuery, favorites, setFavoritesDrawerOpen } = useStoreBrowse();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/store", label: translate("nav.store") },
    { href: "/#pricing", label: translate("nav.pricing") },
    { href: "/workspace", label: translate("nav.startDesign") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white shadow-sm">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-4 px-4 md:gap-6 md:px-6">
        <Link href="/" className="shrink-0">
          <span className="text-xl font-bold tracking-tight text-[#1e3a5f]">Planasia</span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          <Link href="/store" className="text-xs font-semibold uppercase tracking-wide text-[#1e40af]">
            {translate("nav.store")}
          </Link>
          <Link
            href="/#pricing"
            className="text-xs font-semibold uppercase tracking-wide text-text-secondary hover:text-text-primary"
          >
            {translate("nav.pricing")}
          </Link>
          <Link
            href="/workspace"
            className="text-xs font-semibold uppercase tracking-wide text-text-secondary hover:text-text-primary"
          >
            {translate("nav.startDesign")}
          </Link>
        </nav>

        <div className="mx-auto hidden max-w-md flex-1 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={translate("store.searchPlaceholder")}
              className="w-full rounded-full border border-border bg-surface-raised py-2 pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="rounded-full p-2 text-text-muted hover:bg-surface-raised lg:hidden"
            aria-label={translate("nav.menu")}
          >
            <Menu className="h-5 w-5" />
          </button>

          <select
            aria-label={translate("language.select")}
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="hidden rounded-lg border border-border px-2 py-1.5 text-xs sm:block"
          >
            {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
              <option key={loc} value={loc}>
                {LOCALE_LABELS[loc]}
              </option>
            ))}
          </select>

          <select
            aria-label={translate("country.select")}
            value={country.code}
            onChange={(e) => setCountryCode(e.target.value)}
            className="hidden rounded-lg border border-border px-2 py-1.5 text-xs md:block"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name[locale]}
              </option>
            ))}
          </select>

          {status === "authenticated" && session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="h-8 w-8 rounded-full" />
          ) : (
            <button
              type="button"
              onClick={() => signIn("google")}
              className="flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{translate("nav.login")}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setFavoritesDrawerOpen(true)}
            className="relative rounded-full p-2 text-text-muted hover:bg-surface-raised"
            aria-label={translate("store.aria.favorites")}
          >
            <Heart className={`h-4 w-4 ${favorites.length > 0 ? "fill-[#1e40af] text-[#1e40af]" : ""}`} />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1e40af] px-1 text-[10px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="relative rounded-full p-2 text-text-muted hover:bg-surface-raised"
            aria-label={translate("store.cartTitle")}
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1e40af] px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={navLinks}
        footer={
          <div className="space-y-3">
            <div className="relative md:hidden">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={translate("store.searchPlaceholder")}
                className="w-full rounded-lg border border-border py-2 pl-10 pr-3 text-sm outline-none focus:border-accent"
              />
            </div>
            <select
              aria-label={translate("language.select")}
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              {(Object.keys(LOCALE_LABELS) as Locale[]).map((loc) => (
                <option key={loc} value={loc}>
                  {LOCALE_LABELS[loc]}
                </option>
              ))}
            </select>
            <select
              aria-label={translate("country.select")}
              value={country.code}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name[locale]}
                </option>
              ))}
            </select>
          </div>
        }
      />
    </header>
  );
}
