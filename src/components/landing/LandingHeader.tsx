"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  ChevronDown,
  CircleUser,
  Heart,
  LogOut,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { SellerEntryButton } from "@/components/layout/SellerEntryButton";
import { MobileNavDrawer } from "@/components/ui/MobileNavDrawer";
import { useApp } from "@/context/AppContext";
import { useStoreBrowseOptional } from "@/context/StoreBrowseContext";
import { useStoreCartOptional } from "@/context/StoreCartContext";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import { useBilingual } from "@/components/landing/useBilingual";
import { COLLECTIONS } from "@/lib/store/taxonomy";
import { customerServiceTopicCatalog } from "@/lib/content/customer-service";
import { CollectionsMegaMenuPanel } from "@/components/landing/CollectionsMegaMenu";

interface NavItem {
  href: string;
  label: string;
  /** Open in a new tab (external destinations). */
  external?: boolean;
}

/** Shared site header — identical chrome on home, store, about, draftsmen, etc. */
export function LandingHeader() {
  const { translate } = useApp();
  const L = useBilingual();
  const router = useRouter();
  const { data: session, status } = useSession();
  const siteConfig = useSiteConfigOptional();
  const cart = useStoreCartOptional();
  const browse = useStoreBrowseOptional();
  const [menuOpen, setMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const contactPhone =
    siteConfig?.settings.footer.contactPhone?.trim() || "061-691-1599";
  const phoneTel = contactPhone.replace(/[^\d+]/g, "") || "0616911599";

  const searchQuery = browse?.searchQuery ?? localSearch;
  const setSearchQuery = browse?.setSearchQuery ?? setLocalSearch;
  const favoriteCount = browse?.favorites.length ?? 0;
  const cartCount = cart?.itemCount ?? 0;

  // Store — direct link to the marketplace (no dropdown).
  const storeLabel = L("Store", "Store");

  // คอลเลคชั่น — existing categories pulled from the shared taxonomy.
  const collectionItems: NavItem[] = COLLECTIONS.map((c) => ({
    href: `/store?collection=${c.id}`,
    label: L(c.en, c.th),
  }));

  // บริการลูกค้า — หัวข้อจาก CMS + ลิงก์ภายนอกที่เกี่ยวข้อง
  const aboutItems: NavItem[] = [
    ...customerServiceTopicCatalog(siteConfig?.customerServiceArticles).map((topic) => ({
      href: topic.href,
      label: L(topic.titleEn, topic.titleTh),
    })),
    {
      href: "https://dashboard.doctranslator.com/home?locale=th",
      label: L(
        "Construction plan translation",
        "แปลภาษาในแบบแปลนก่อสร้าง",
      ),
      external: true,
    },
  ];

  const planIncludesLabel = L("What the Plan Includes", "แบบประกอบด้วยอะไรบ้าง");
  const homeBuildingLabel = L("Home Building", "รับสร้างบ้าน");
  const draftsmenLabel = translate("nav.findDraftsman");

  const mobileLinks: NavItem[] = [
    { href: "/", label: translate("nav.home") },
    { href: "/store", label: storeLabel },
    ...collectionItems,
    { href: "/whats-included", label: planIncludesLabel },
    ...aboutItems,
    { href: "/draftsmen", label: draftsmenLabel },
    { href: "/home-building", label: homeBuildingLabel },
  ];

  const submitPlanSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Support "ABC-123" or "#ABC-123" plan / blueprint codes.
    const q = searchQuery.trim().replace(/^#/, "");
    if (browse) browse.setSearchQuery(q);
    router.push(q ? `/store?search=${encodeURIComponent(q)}` : "/store");
  };

  const openWishlist = () => {
    if (browse) {
      browse.setFavoritesDrawerOpen(true);
      return;
    }
    router.push("/store");
  };

  const openCart = () => {
    if (cart) {
      cart.setDrawerOpen(true);
      return;
    }
    router.push("/store");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e6e8ee] bg-white/95 font-sans backdrop-blur-md">
      {/* Top bar — brand navy utility strip (tagline + phone, no overlap) */}
      <div className="bg-[#1A2744] text-white">
        <div className="relative mx-auto flex w-full max-w-[1440px] flex-col items-center gap-1.5 px-4 py-2.5 md:min-h-10 md:flex-row md:items-center md:justify-end md:gap-0 md:px-6 md:py-1.5">
          <p className="w-full max-w-prose text-center text-[11px] font-semibold leading-snug tracking-[0.01em] text-white sm:text-xs md:absolute md:inset-x-0 md:max-w-none md:truncate md:px-48 md:text-[13px]">
            {L(
              "The hub for Thai designers' blueprints and portfolios — going global",
              "ศูนย์รวมแบบแปลนและผลงานนักเขียนแบบไทย ก้าวไกลสู่สากล",
            )}
          </p>
          <a
            href={`tel:${phoneTel}`}
            aria-label={`${L("Call", "โทร")} ${contactPhone}`}
            className="topbar-phone relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-white transition-colors hover:bg-white/10 hover:text-white md:gap-2"
          >
            <Phone className="h-4 w-4 shrink-0 md:h-[18px] md:w-[18px]" strokeWidth={2.25} aria-hidden />
            <span className="topbar-phone__number">{contactPhone}</span>
          </a>
        </div>
      </div>

      {/*
        Balanced header grid:
        Left brand+Store | Center nav (true center) | Right tools
      */}
      <div className="site-header-bar mx-auto w-full max-w-[1440px] px-4 sm:px-5 md:px-6 lg:px-8">
        {/* LEFT */}
        <div className="site-header-brand">
          <BrandLogo variant="light" />
          <Link
            href="/store"
            className="nav-store-btn header-control hidden text-white md:inline-flex"
          >
            {storeLabel}
          </Link>
        </div>

        {/* CENTER — optically centered between equal side columns */}
        <nav aria-label={L("Main navigation", "เมนูหลัก")} className="site-header-nav">
          <NavDropdown label={L("Collections", "คอลเลคชั่น")} items={collectionItems} mega="collections" />
          <NavLink href="/whats-included" label={planIncludesLabel} />
          <NavDropdown
            label={L("Customer Service", "บริการลูกค้า")}
            href="/about"
            items={aboutItems}
            list="clean"
          />
          <NavLink href="/draftsmen" label={draftsmenLabel} />
          <NavLink href="/home-building" label={homeBuildingLabel} />
        </nav>

        {/* RIGHT — search · account · icons · seller */}
        <div className="site-header-tools">
          <form onSubmit={submitPlanSearch} className="hidden md:block">
            <div className="header-search border border-border bg-white shadow-sm focus-within:border-[#1e40af]/50 focus-within:ring-1 focus-within:ring-[#1e40af]/20">
              <span
                className="flex shrink-0 items-center pl-2 text-[11px] font-semibold text-[#1e40af]"
                aria-hidden
              >
                #
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={translate("nav.searchByPlan")}
                aria-label={translate("nav.searchByPlan")}
                inputMode="search"
                autoComplete="off"
                className="min-w-0 flex-1 border-none bg-transparent px-1 text-[#1e3a5f] outline-none placeholder:text-slate-500"
              />
              <button
                type="submit"
                aria-label={translate("nav.searchByPlan")}
                className="flex shrink-0 items-center justify-center bg-[#1e40af] px-2 text-white transition-colors hover:bg-[#1e3a8a]"
              >
                <Search className="h-3 w-3" strokeWidth={2.25} />
              </button>
            </div>
          </form>

          <span className="site-header-tools__divider" aria-hidden />

          <div className="site-header-tools__cluster">
            <div className="hidden md:block">
              <LanguageToggle variant="light" />
            </div>

            {status === "authenticated" ? (
              <AccountMenu
                image={session?.user?.image}
                name={session?.user?.name}
                email={session?.user?.email}
                draftsmanLabel={L("Seller dashboard", "แดชบอร์ดผู้เขียนแบบ")}
                signOutLabel={L("Sign out", "ออกจากระบบ")}
              />
            ) : (
              <button
                type="button"
                onClick={() => signIn("google")}
                aria-label={translate("nav.signIn")}
                className="header-control hidden text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af] sm:inline-flex"
              >
                <CircleUser className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
                <span className="hidden xl:inline">{translate("nav.signIn")}</span>
              </button>
            )}
          </div>

          <span className="site-header-tools__divider" aria-hidden />

          <div className="site-header-tools__cluster">
            <button
              type="button"
              onClick={openWishlist}
              aria-label={translate("nav.wishlist")}
              title={translate("nav.wishlist")}
              className="header-action-icon relative flex items-center justify-center rounded-md text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af]"
            >
              <Heart
                className={`h-[18px] w-[18px] ${favoriteCount > 0 ? "fill-[#1e40af] text-[#1e40af]" : ""}`}
                strokeWidth={1.75}
              />
              {favoriteCount > 0 && (
                <span className="absolute right-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#1e40af] px-0.5 text-[9px] font-semibold text-white">
                  {favoriteCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label={translate("nav.cart")}
              title={translate("nav.cart")}
              className="header-action-icon relative flex items-center justify-center rounded-md text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af]"
            >
              <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#1e40af] px-0.5 text-[9px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <SellerEntryButton />

          {/* Mobile only — hidden from md (desktop) upward */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="header-control-icon flex items-center justify-center rounded-md text-[#1e3a5f] hover:bg-surface-raised hover:text-[#1e40af] md:hidden"
            aria-label={translate("nav.menu")}
          >
            <Menu className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>

      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={mobileLinks}
        variant="light"
        footer={
          <div className="space-y-4">
            <form onSubmit={submitPlanSearch} className="md:hidden">
              <div className="flex h-11 items-stretch overflow-hidden rounded-lg border border-border bg-white focus-within:border-[#1e40af]">
                <span className="flex items-center pl-3 text-sm font-bold text-[#1e40af]" aria-hidden>
                  #
                </span>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={translate("nav.searchByPlan")}
                  aria-label={translate("nav.searchByPlan")}
                  className="min-w-0 flex-1 border-none bg-transparent px-2 text-sm font-medium text-[#1e3a5f] outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  aria-label={translate("nav.searchByPlan")}
                  className="flex w-11 items-center justify-center bg-[#1e40af] text-white"
                >
                  <Search className="h-4 w-4" strokeWidth={2.25} />
                </button>
              </div>
            </form>
            <div className="flex flex-wrap gap-2 md:hidden">
              <LanguageToggle variant="light" />
            </div>
            {status === "authenticated" ? (
              <div className="space-y-2 sm:hidden">
                <Link
                  href="/dashboard/draftsman"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-text-primary"
                >
                  <UserRound className="h-4 w-4" />
                  {L("Seller dashboard", "แดชบอร์ดผู้เขียนแบบ")}
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  {L("Sign out", "ออกจากระบบ")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signIn("google")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-text-primary sm:hidden"
              >
                <CircleUser className="h-5 w-5" strokeWidth={1.6} aria-hidden />
                {translate("nav.signIn")}
              </button>
            )}
          </div>
        }
      />
    </header>
  );
}

function AccountMenu({
  image,
  name,
  email,
  draftsmanLabel,
  signOutLabel,
}: {
  image?: string | null;
  name?: string | null;
  email?: string | null;
  draftsmanLabel: string;
  signOutLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const initials =
    (name ?? email ?? "U")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={name || email || "Account"}
        onClick={() => setOpen((v) => !v)}
        className="header-control-icon flex shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-border transition hover:ring-[#1e40af]/50"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-[#1e40af] text-[11px] font-bold text-white">
            {initials}
          </span>
        )}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full z-[60] mt-1.5 min-w-[200px] rounded-lg border border-border/80 bg-white py-1.5 shadow-[0_10px_28px_rgba(15,23,42,0.12)]"
        >
          {(name || email) && (
            <div className="border-b border-border/70 px-3 py-2">
              {name && <p className="truncate text-[12px] font-semibold text-[#1e3a5f]">{name}</p>}
              {email && <p className="truncate text-[11px] text-slate-500">{email}</p>}
            </div>
          )}
          <Link
            href="/dashboard/draftsman"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af]"
          >
            <UserRound className="h-3.5 w-3.5" strokeWidth={2} />
            {draftsmanLabel}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              void signOut({ callbackUrl: "/" });
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af]"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
            {signOutLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function NavLink({ href, label }: NavItem) {
  return (
    <Link
      href={href}
      className="header-control text-[#1A2744] transition-colors hover:bg-[#f4f5f8] hover:text-[#C45C3A]"
    >
      {label}
    </Link>
  );
}

function NavDropdown({
  label,
  href,
  items,
  primary = false,
  emptyLabel,
  mega,
  list = "default",
}: {
  label: string;
  href?: string;
  items: NavItem[];
  primary?: boolean;
  emptyLabel?: string;
  /** When set, renders a visual mega-menu panel instead of a text list. */
  mega?: "collections";
  /** Clean list = taller hit targets, article-style labels (About menu). */
  list?: "default" | "clean";
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  // Store = brand pill reference; all nav triggers share header-control scale.
  const triggerClass = primary
    ? `nav-store-btn header-control text-white ${open ? "brightness-110" : ""}`
    : open
      ? "header-control bg-[#1A2744] text-white"
      : "header-control text-[#1A2744] transition-colors hover:bg-[#f4f5f8] hover:text-[#C45C3A]";

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      {href && !mega ? (
        <Link
          href={href}
          className={triggerClass}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen(false)}
          onFocus={openNow}
        >
          {label}
          <ChevronDown
            className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        </Link>
      ) : (
        <button
          type="button"
          className={triggerClass}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (closeTimer.current) clearTimeout(closeTimer.current);
            setOpen((v) => !v);
          }}
        >
          {label}
          <ChevronDown
            className={`h-3 w-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
            aria-hidden
          />
        </button>
      )}

      {open && mega === "collections" && (
        <div
          id={menuId}
          role="menu"
          className="absolute left-0 top-full z-[80] pt-2"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
        >
          <CollectionsMegaMenuPanel onNavigate={() => setOpen(false)} />
        </div>
      )}

      {open && !mega && (
        <div
          id={menuId}
          role="menu"
          className={
            list === "clean"
              ? "absolute left-0 top-full z-[80] mt-1.5 min-w-[260px] max-w-[320px] rounded-lg border border-border/80 bg-white py-2 shadow-[0_10px_28px_rgba(15,23,42,0.12)]"
              : "absolute left-0 top-full z-[80] mt-1 min-w-[200px] rounded-md border border-border bg-white py-1 shadow-lg"
          }
        >
          {items.length === 0 ? (
            <span className="block px-3 py-1.5 text-[11px] font-medium italic text-slate-500">
              {emptyLabel ?? "—"}
            </span>
          ) : (
            items.map((item) => {
              const itemClass =
                list === "clean"
                  ? "block px-4 py-2.5 text-[12px] font-semibold leading-snug tracking-wide text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af]"
                  : "block px-3 py-1.5 text-[11px] font-semibold tracking-wide text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af]";
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className={itemClass}
                  >
                    {item.label}
                  </a>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={itemClass}
                >
                  {item.label}
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
