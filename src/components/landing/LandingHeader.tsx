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
  Package,
  PenLine,
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

  const sloganText = L(
    "The hub for Thai designers' blueprints and portfolios — going global",
    "ศูนย์รวมแบบแปลนและผลงานสถาปนิกและนักออกแบบไทย ก้าวไกลสู่สากล",
  );

  return (
    <header className="sticky top-0 z-50 max-w-full border-b border-[#e6e8ee] bg-white/95 font-sans backdrop-blur-md">
      {/* 1) Top phone banner — phone only on mobile (ABHP-style) */}
      <div className="bg-[#1A2744] text-white">
        <div className="relative mx-auto flex w-full max-w-[1440px] items-center justify-end px-3 py-1.5 sm:px-4 md:min-h-10 md:px-6">
          {/* Desktop: centered slogan in the navy bar */}
          <p
            className="site-topbar-slogan header-desktop-only absolute inset-x-0 truncate px-48 text-center text-[13px] font-semibold leading-none tracking-[0.01em] text-white"
            title={sloganText}
          >
            {sloganText}
          </p>
          <a
            href={`tel:${phoneTel}`}
            aria-label={`${L("Call", "โทร")} ${contactPhone}`}
            className="topbar-phone relative z-10 inline-flex shrink-0 items-center gap-1.5 rounded-sm px-1 py-0.5 text-white transition-colors hover:bg-white/10 md:gap-2 md:px-1.5"
          >
            <Phone className="h-3.5 w-3.5 shrink-0 md:h-[18px] md:w-[18px]" strokeWidth={2.25} aria-hidden />
            <span className="topbar-phone__number text-[13px] md:text-[0.9375rem]">{contactPhone}</span>
          </a>
        </div>
      </div>

      {/* 2) Mobile slogan strip — ≤768px only (does not affect desktop) */}
      <div className="header-mobile-only w-full flex-col border-b border-[#e6e8ee] bg-[#f7f8fa]">
        <p
          className="site-topbar-slogan mx-auto max-w-[1440px] truncate px-3 py-1 text-center text-[10px] font-medium leading-none tracking-[0.01em] text-[#1A2744]/80"
          title={sloganText}
        >
          {sloganText}
        </p>
      </div>

      {/*
        3) Main header row
        Desktop (>768): [brand+Store | nav | tools] — CSS grid, no overlap
        Mobile (≤768): [logo | search | hamburger] — isolated media query
      */}
      <div className="site-header-bar mx-auto w-full max-w-[1440px] px-3 sm:px-5 md:px-6 lg:px-8">
        {/* LEFT — logo (+ Store on desktop) */}
        <div className="site-header-brand">
          <BrandLogo variant="light" className="site-header-logo" />
          <Link
            href="/store"
            className="nav-store-btn header-control header-desktop-only text-white"
          >
            {storeLabel}
          </Link>
        </div>

        {/* Mobile search — hidden on desktop via .site-header-mobile-search */}
        <form onSubmit={submitPlanSearch} className="site-header-mobile-search">
          <div className="flex h-9 w-full min-w-0 items-stretch overflow-hidden rounded-md border border-[#d5d9e0] bg-white focus-within:border-[#1e40af] focus-within:ring-1 focus-within:ring-[#1e40af]/25">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={translate("nav.searchByPlan")}
              aria-label={translate("nav.searchByPlan")}
              inputMode="search"
              autoComplete="off"
              className="min-w-0 flex-1 border-none bg-transparent px-2.5 text-[12px] font-medium text-[#1e3a5f] outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              aria-label={translate("nav.searchByPlan")}
              className="flex w-9 shrink-0 items-center justify-center bg-[#1A2744] text-white transition-colors hover:bg-[#243556]"
            >
              <Search className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </div>
        </form>

        {/* Desktop nav — hidden on ≤768px via .site-header-nav */}
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

        {/* RIGHT — desktop tools · mobile hamburger only */}
        <div className="site-header-tools">
          <form onSubmit={submitPlanSearch} className="header-desktop-only">
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

          <span className="site-header-tools__divider header-desktop-only" aria-hidden />

          <div className="site-header-tools__cluster header-desktop-only">
            <LanguageToggle variant="light" />

            {status === "authenticated" ? (
              <AccountMenu
                image={session?.user?.image}
                name={session?.user?.name}
                email={session?.user?.email}
                purchasesLabel={L("My purchases", "การซื้อของฉัน")}
                draftsmanLabel={L("Seller dashboard", "แดชบอร์ดผู้เขียนแบบ")}
                signOutLabel={L("Sign out", "ออกจากระบบ")}
              />
            ) : (
              <button
                type="button"
                onClick={() => signIn("google")}
                aria-label={translate("nav.signIn")}
                className="header-control text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af]"
              >
                <CircleUser className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
                <span className="hidden xl:inline">{translate("nav.signIn")}</span>
              </button>
            )}
          </div>

          <span className="site-header-tools__divider header-desktop-only" aria-hidden />

          <div className="site-header-tools__cluster header-desktop-only">
            <button
              type="button"
              onClick={openWishlist}
              aria-label={translate("nav.wishlist")}
              title={translate("nav.wishlist")}
              className="header-action-icon relative flex shrink-0 items-center justify-center rounded-md text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af]"
            >
              <Heart
                className={`h-[18px] w-[18px] ${favoriteCount > 0 ? "fill-[#1e40af] text-[#1e40af]" : ""}`}
                strokeWidth={1.75}
              />
              {favoriteCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#1e40af] px-0.5 text-[9px] font-semibold text-white">
                  {favoriteCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label={translate("nav.cart")}
              title={translate("nav.cart")}
              className="header-action-icon relative flex shrink-0 items-center justify-center rounded-md text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af]"
            >
              <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#1e40af] px-0.5 text-[9px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          <SellerEntryButton className="header-desktop-only" />

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="header-mobile-only header-control-icon h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#1e3a5f] hover:bg-surface-raised hover:text-[#1e40af]"
            aria-label={translate("nav.menu")}
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
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
            <div className="grid grid-cols-2 gap-2 md:hidden">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openWishlist();
                }}
                className="relative flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-text-primary"
              >
                <Heart className="h-4 w-4" />
                {translate("nav.wishlist")}
                {favoriteCount > 0 && (
                  <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1e40af] px-1 text-[10px] font-semibold text-white">
                    {favoriteCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  openCart();
                }}
                className="relative flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-text-primary"
              >
                <ShoppingCart className="h-4 w-4" />
                {translate("nav.cart")}
                {cartCount > 0 && (
                  <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#1e40af] px-1 text-[10px] font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 md:hidden">
              <LanguageToggle variant="light" />
            </div>
            <Link
              href="/dashboard/draftsman"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A2744] py-2.5 text-sm font-semibold text-white md:hidden"
            >
              <PenLine className="h-4 w-4" />
              {translate("nav.seller")}
            </Link>
            {status === "authenticated" ? (
              <div className="space-y-2 md:hidden">
                <Link
                  href="/purchases"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-semibold text-text-primary"
                >
                  <Package className="h-4 w-4" />
                  {L("My purchases", "การซื้อของฉัน")}
                </Link>
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
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm font-medium text-text-primary md:hidden"
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
  purchasesLabel,
  draftsmanLabel,
  signOutLabel,
}: {
  image?: string | null;
  name?: string | null;
  email?: string | null;
  purchasesLabel: string;
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
            href="/purchases"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af]"
          >
            <Package className="h-3.5 w-3.5" strokeWidth={2} />
            {purchasesLabel}
          </Link>
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

function NavLink({
  href,
  label,
  className = "",
}: NavItem & { className?: string }) {
  return (
    <Link
      href={href}
      className={`header-control text-[#1A2744] transition-colors hover:bg-[#f4f5f8] hover:text-[#C45C3A] ${className}`}
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
  const [megaTop, setMegaTop] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const megaPanelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  const updateMegaPosition = () => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Sit just under the trigger; keep a small gap inside the viewport.
    setMegaTop(Math.min(rect.bottom + 6, window.innerHeight - 24));
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      const inTrigger = wrapRef.current?.contains(target);
      const inMega = megaPanelRef.current?.contains(target);
      if (!inTrigger && !inMega) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open || mega !== "collections") return;
    updateMegaPosition();
    window.addEventListener("resize", updateMegaPosition);
    window.addEventListener("scroll", updateMegaPosition, true);
    return () => {
      window.removeEventListener("resize", updateMegaPosition);
      window.removeEventListener("scroll", updateMegaPosition, true);
    };
  }, [open, mega]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const openNow = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    updateMegaPosition();
    setOpen(true);
  };
  const closeSoon = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };
  const toggleOpen = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    updateMegaPosition();
    setOpen((v) => !v);
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
            toggleOpen();
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

      {/* Viewport-centered fixed panel — never clipped by nav / never overflows edges */}
      {open && mega === "collections" && (
        <div
          ref={megaPanelRef}
          id={menuId}
          role="menu"
          className="fixed left-1/2 z-[120] w-[min(920px,calc(100vw-1.5rem))] max-w-[calc(100vw-1.5rem)] -translate-x-1/2"
          style={{ top: megaTop }}
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
              ? "absolute left-0 top-full z-[120] mt-1.5 min-w-[260px] max-w-[320px] rounded-lg border border-border/80 bg-white py-2 shadow-[0_10px_28px_rgba(15,23,42,0.12)]"
              : "absolute left-0 top-full z-[120] mt-1 min-w-[200px] rounded-md border border-border bg-white py-1 shadow-lg"
          }
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
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
