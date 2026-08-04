/**
 * Shared storefront chrome rules — hide global FABs / nav / footer on admin,
 * keep Buy CTAs clear of floating widgets on listing detail pages.
 */

/** Dispatched by MobileBottomNav Chat tab to open FloatingContactFab. */
export const OPEN_CONTACT_EVENT = "planasia:open-contact";

export function isAdminPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

/** Store listing detail (`/store/[slug]`), not the browse index `/store`. */
export function isStoreListingPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname.startsWith("/store/");
}

/** Footer + mobile bottom nav — hide inside admin console. */
export function shouldHidePublicChrome(pathname: string | null | undefined): boolean {
  return isAdminPath(pathname);
}

/**
 * AI plan-finder FAB (home has in-hero entry; listing detail needs clear Buy CTAs).
 * The AiPlanChat shell can still mount for event-driven open.
 */
export function shouldHideAiFab(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  if (isAdminPath(pathname)) return true;
  if (pathname === "/") return true;
  if (isStoreListingPath(pathname)) return true;
  return false;
}

/** Unmount contact FAB entirely only on admin. */
export function shouldHideContactFab(pathname: string | null | undefined): boolean {
  return isAdminPath(pathname);
}

/**
 * Hide the desktop contact trigger on listing detail so it cannot cover Buy.
 * Component stays mounted so MobileBottomNav Chat can still open the menu.
 */
export function shouldHideContactFabTrigger(
  pathname: string | null | undefined,
): boolean {
  return isStoreListingPath(pathname);
}
