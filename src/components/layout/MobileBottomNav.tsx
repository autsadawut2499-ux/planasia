"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUser, Heart, ShoppingCart } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useApp } from "@/context/AppContext";
import { useStoreBrowseOptional } from "@/context/StoreBrowseContext";
import { useStoreCartOptional } from "@/context/StoreCartContext";
import { OPEN_CONTACT_EVENT } from "@/components/layout/FloatingContactFab";

function shouldHideBottomNav(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Blueprint / shop mark — architectural outline for the store tab. */
function PlanShopIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 21V9.5L12 4l8 5.5V21" />
      <path d="M9 21v-7h6v7" />
      <path d="M4 12h16" />
      <path d="M12 4v4" />
    </svg>
  );
}

/** Support headset — matches ABHP-style chat tab. */
function ChatHeadsetIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 14v2a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2z" />
      <path d="M20 14v2a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z" />
      <path d="M14 19h-2a2 2 0 0 1-2-2v-1" />
    </svg>
  );
}

type TabTone = "idle" | "active";

function tabClass(tone: TabTone) {
  return tone === "active"
    ? "text-[#1A2744]"
    : "text-slate-500 hover:text-[#1A2744]/80";
}

/**
 * Fixed mobile bottom navigation (ABHP-style).
 * Hidden on desktop (lg+) and admin routes.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { translate } = useApp();
  const { status } = useSession();
  const cart = useStoreCartOptional();
  const browse = useStoreBrowseOptional();

  if (shouldHideBottomNav(pathname)) return null;

  const favoriteCount = browse?.favorites.length ?? 0;
  const cartCount = cart?.itemCount ?? 0;
  const authenticated = status === "authenticated";

  const shopActive = Boolean(pathname?.startsWith("/store"));
  const accountActive = Boolean(
    pathname === "/purchases" || pathname?.startsWith("/purchases/")
  );
  const favoritesActive = Boolean(browse?.favoritesDrawerOpen);
  const cartActive = Boolean(cart?.drawerOpen);

  const openWishlist = () => {
    if (browse) {
      browse.setFavoritesDrawerOpen(true);
      cart?.setDrawerOpen(false);
      return;
    }
    window.location.href = "/store";
  };

  const openCart = () => {
    if (cart) {
      cart.setDrawerOpen(true);
      browse?.setFavoritesDrawerOpen(false);
      return;
    }
    window.location.href = "/store";
  };

  const openChat = () => {
    window.dispatchEvent(new CustomEvent(OPEN_CONTACT_EVENT));
  };

  const accountLabel = authenticated
    ? translate("nav.account")
    : translate("nav.signIn");

  return (
    <>
      <nav
        className="mobile-bottom-nav"
        aria-label={translate("nav.bottomNav")}
      >
        <div className="mobile-bottom-nav__inner">
          <Link
            href="/store"
            className={`mobile-bottom-nav__item ${tabClass(shopActive ? "active" : "idle")}`}
            aria-current={shopActive ? "page" : undefined}
          >
            <PlanShopIcon className="mobile-bottom-nav__icon" />
            <span className="mobile-bottom-nav__label">{translate("nav.shop")}</span>
          </Link>

          {authenticated ? (
            <Link
              href="/purchases"
              className={`mobile-bottom-nav__item ${tabClass(accountActive ? "active" : "idle")}`}
              aria-current={accountActive ? "page" : undefined}
            >
              <CircleUser className="mobile-bottom-nav__icon" strokeWidth={1.75} />
              <span className="mobile-bottom-nav__label">{accountLabel}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google")}
              className={`mobile-bottom-nav__item ${tabClass("idle")}`}
              aria-label={accountLabel}
            >
              <CircleUser className="mobile-bottom-nav__icon" strokeWidth={1.75} />
              <span className="mobile-bottom-nav__label">{accountLabel}</span>
            </button>
          )}

          <button
            type="button"
            onClick={openWishlist}
            className={`mobile-bottom-nav__item ${tabClass(favoritesActive ? "active" : "idle")}`}
            aria-label={translate("nav.wishlist")}
            aria-pressed={favoritesActive}
          >
            <span className="mobile-bottom-nav__icon-wrap">
              <Heart
                className={`mobile-bottom-nav__icon ${
                  favoriteCount > 0 || favoritesActive ? "fill-current" : ""
                }`}
                strokeWidth={1.75}
              />
              {favoriteCount > 0 && (
                <span className="mobile-bottom-nav__badge">{favoriteCount}</span>
              )}
            </span>
            <span className="mobile-bottom-nav__label">{translate("nav.wishlist")}</span>
          </button>

          <button
            type="button"
            onClick={openCart}
            className={`mobile-bottom-nav__item ${tabClass(cartActive ? "active" : "idle")}`}
            aria-label={translate("nav.cart")}
            aria-pressed={cartActive}
          >
            <span className="mobile-bottom-nav__icon-wrap">
              <ShoppingCart className="mobile-bottom-nav__icon" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="mobile-bottom-nav__badge">{cartCount}</span>
              )}
            </span>
            <span className="mobile-bottom-nav__label">{translate("nav.cart")}</span>
          </button>

          <button
            type="button"
            onClick={openChat}
            className={`mobile-bottom-nav__item ${tabClass("idle")}`}
            aria-label={translate("nav.chat")}
          >
            <ChatHeadsetIcon className="mobile-bottom-nav__icon" />
            <span className="mobile-bottom-nav__label">{translate("nav.chat")}</span>
          </button>
        </div>
      </nav>
      {/* Reserves scroll space so page content clears the fixed bar */}
      <div className="mobile-bottom-nav-spacer" aria-hidden />
    </>
  );
}
