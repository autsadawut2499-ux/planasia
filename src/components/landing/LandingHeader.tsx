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
import {
  MobileNavDrawer,
  type MobileNavLink,
} from "@/components/ui/MobileNavDrawer";
import { useApp } from "@/context/AppContext";
import { useStoreBrowseOptional } from "@/context/StoreBrowseContext";
import { useStoreCartOptional } from "@/context/StoreCartContext";
import { useSiteConfigOptional } from "@/context/SiteConfigContext";
import { useBilingual } from "@/components/landing/useBilingual";
import { COLLECTIONS } from "@/lib/store/taxonomy";
import { PUBLIC_SELLER_SELF_LISTING_ENABLED } from "@/lib/features/public-seller";
import { CollectionsMegaMenuPanel } from "@/components/landing/CollectionsMegaMenu";
import { SITE_VALUE_PROPOSITION } from "@/lib/seo/site-copy";

interface NavItem {
  href: string;
  label: string;
  /** Open in a new tab (external destinations). */
  external?: boolean;
}

/** Shared site header — identical chrome on home, store, about, etc. */
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
    siteConfig?.settings.footer.contactPhone?.trim() || "094-286-6661";
  const phoneTel = contactPhone.replace(/[^\d+]/g, "") || "0942866661";

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

  const planIncludesLabel = L("What the Plan Includes", "แบบประกอบด้วยอะไรบ้าง");
  const loanConsultLabel = L("Home loan consultation", "ปรึกษาสินเชื่อบ้าน");
  const articlesLabel = L("Articles", "บทความ");
  const homeBuildingLabel = L("Home Building", "รับสร้างบ้าน");

  const mobileLinks: MobileNavLink[] = [
    { href: "/", label: translate("nav.home") },
    {
      href: "/store",
      label: storeLabel,
      children: [
        { href: "/store", label: L("All house plans", "แบบบ้านทั้งหมด") },
        ...collectionItems,
      ],
    },
    { href: "/whats-included", label: planIncludesLabel },
    { href: "/articles", label: articlesLabel },
    { href: "/loan-consultation", label: loanConsultLabel },
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
    <header
      className="sticky top-0 z-50 max-w-full border-b border-[#e6e8ee] bg-white/95 font-sans backdrop-blur-md"
      aria-label={L("Site header", "ส่วนหัวเว็บไซต์")}
    >
      {/* 1) Announcement — topmost strip (not an H1; homepage owns the page H1) */}
      <div
        role="region"
        aria-label={L("Site announcement", "ประกาศเว็บไซต์")}
        className="site-announcement border-b border-[#1A2744]/12 bg-[#f0f3f8] text-[#1A2744]"
      >
        <p className="site-announcement__text mx-auto w-full max-w-[1440px] px-3 py-1.5 text-center sm:px-4 md:px-6">
          {SITE_VALUE_PROPOSITION}
        </p>
      </div>

      {/* 2) Phone contact strip */}
      <div className="bg-[#1A2744] text-white" aria-label={L("Contact phone", "เบอร์ติดต่อ")}>
        <div className="relative mx-auto flex w-full max-w-[1440px] items-center justify-end px-3 py-1.5 sm:px-4 md:min-h-10 md:px-6">
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

      {/*
        3) Main header
        Desktop (≥1025): row1 [logo | search | tools] · row2 [nav]
        Compact (≤1024): [logo | search | hamburger]
      */}
      <div className="site-header-bar mx-auto w-full max-w-[1440px] px-3 sm:px-5 md:px-6 lg:px-8">
        <div className="site-header-brand">
          <BrandLogo variant="light" className="site-header-logo" />
        </div>

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
              className="min-w-0 flex-1 border-none bg-transparent px-2.5 text-[12px] font-medium text-black outline-none placeholder:text-slate-400"
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

        <form onSubmit={submitPlanSearch} className="site-header-search header-desktop-only">
          <div className="header-search border border-[#d5d9e0] bg-white focus-within:border-[#1e40af] focus-within:ring-1 focus-within:ring-[#1e40af]/20">
            <span
              className="flex shrink-0 items-center pl-3 text-[13px] font-semibold text-slate-400"
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
              className="min-w-0 flex-1 border-none bg-transparent px-2 text-black outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              aria-label={translate("nav.searchByPlan")}
              className="flex shrink-0 items-center justify-center bg-[#1A2744] px-3 text-white transition-colors hover:bg-[#243556]"
            >
              <Search className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>
        </form>

        <div className="site-header-tools">
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
                className="header-control text-[#1e3a5f] transition-colors hover:bg-[#f4f5f8] hover:text-[#1e40af]"
              >
                <CircleUser className="h-4 w-4" strokeWidth={1.6} aria-hidden />
                <span className="hidden xl:inline">{translate("nav.signIn")}</span>
              </button>
            )}

            <button
              type="button"
              onClick={openWishlist}
              aria-label={translate("nav.wishlist")}
              title={translate("nav.wishlist")}
              className="header-action-icon relative flex shrink-0 items-center justify-center rounded-md text-[#1e3a5f] transition-colors hover:bg-[#f4f5f8] hover:text-[#1e40af]"
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
              className="header-action-icon relative flex shrink-0 items-center justify-center rounded-md text-[#1e3a5f] transition-colors hover:bg-[#f4f5f8] hover:text-[#1e40af]"
            >
              <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#1e40af] px-0.5 text-[9px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <SellerEntryButton />
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="header-mobile-only header-control-icon h-9 w-9 shrink-0 items-center justify-center rounded-md text-[#1e3a5f] hover:bg-[#f4f5f8] hover:text-[#1e40af]"
            aria-label={translate("nav.menu")}
          >
            <Menu className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <nav aria-label={L("Main navigation", "เมนูหลัก")} className="site-header-nav">
          <NavLink href="/store" label={storeLabel} />
          <NavDropdown label={L("Collections", "คอลเลคชั่น")} items={collectionItems} mega="collections" />
          <NavLink href="/whats-included" label={planIncludesLabel} />
          <NavLink href="/articles" label={articlesLabel} />
          <NavLink href="/loan-consultation" label={loanConsultLabel} />
          <NavLink href="/home-building" label={homeBuildingLabel} />
        </nav>
      </div>

      <MobileNavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={mobileLinks}
        variant="light"
        footer={
          <div className="flex flex-col gap-2.5">
            <div className="w-full [&_button.header-control]:flex [&_button.header-control]:h-11 [&_button.header-control]:min-h-11 [&_button.header-control]:w-full [&_button.header-control]:justify-center [&_button.header-control]:rounded-lg [&_button.header-control]:text-sm">
              <LanguageToggle variant="light" className="block w-full" />
            </div>
            {PUBLIC_SELLER_SELF_LISTING_ENABLED ? (
              <Link
                href="/dashboard/draftsman"
                onClick={() => setMenuOpen(false)}
                className="flex w-full min-h-11 items-center justify-center gap-2 rounded-lg bg-[#1A2744] px-3 py-2.5 text-sm font-semibold text-white"
              >
                <PenLine className="h-4 w-4 shrink-0" />
                {translate("nav.seller")}
              </Link>
            ) : null}
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
          {PUBLIC_SELLER_SELF_LISTING_ENABLED ? (
            <Link
              href="/dashboard/draftsman"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-[#1e3a5f] transition-colors hover:bg-surface-raised hover:text-[#1e40af]"
            >
              <UserRound className="h-3.5 w-3.5" strokeWidth={2} />
              {draftsmanLabel}
            </Link>
          ) : null}
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
      className={`header-control text-black transition-colors hover:bg-[#f4f5f8] hover:text-black ${className}`}
    >
      {label}
    </Link>
  );
}

function NavDropdown({
  label,
  href,
  items,
  primary: _primary = false,
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

  // All nav triggers: solid black text (logo stays unchanged).
  const triggerClass = open
    ? "header-control bg-[#f4f5f8] text-black"
    : "header-control text-black transition-colors hover:bg-[#f4f5f8] hover:text-black";

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
                  ? "block px-4 py-2.5 text-[12px] font-semibold leading-snug tracking-wide text-black transition-colors hover:bg-surface-raised hover:text-black"
                  : "block px-3 py-1.5 text-[11px] font-semibold tracking-wide text-black transition-colors hover:bg-surface-raised hover:text-black";
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
