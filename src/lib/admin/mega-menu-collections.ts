/**
 * Mega-menu + homepage "Collections" tiles.
 * Stored in site_settings under key `mega_menu_collections`.
 */

import {
  formatCollectionTitleEn,
  formatCollectionTitleTh,
} from "@/lib/store/style-label";

export const MAX_MEGA_MENU_COLLECTIONS = 12;

export interface MegaMenuCollectionCard {
  id: string;
  imageUrl: string;
  titleEn: string;
  titleTh: string;
  /** Internal path e.g. /store?collection=single-storey */
  href: string;
  /** When false, hidden on the storefront but kept in admin. */
  enabled: boolean;
}

export const DEFAULT_MEGA_MENU_COLLECTIONS: MegaMenuCollectionCard[] = [
  {
    id: "single-storey",
    titleEn: formatCollectionTitleEn("Single-Storey"),
    titleTh: formatCollectionTitleTh("บ้านชั้นเดียว"),
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80",
    href: "/store?collection=single-storey",
    enabled: true,
  },
  {
    id: "two-storey",
    titleEn: formatCollectionTitleEn("Two-Storey"),
    titleTh: formatCollectionTitleTh("บ้านสองชั้น"),
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80",
    href: "/store?collection=two-storey",
    enabled: true,
  },
  {
    id: "small",
    titleEn: formatCollectionTitleEn("Small / Narrow"),
    titleTh: formatCollectionTitleTh("บ้านเล็ก / หน้าแคบ"),
    imageUrl:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=400&q=80",
    href: "/store?collection=small",
    enabled: true,
  },
  {
    id: "commercial",
    titleEn: formatCollectionTitleEn("Commercial"),
    titleTh: formatCollectionTitleTh("อาคารพาณิชย์"),
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80",
    href: "/store?collection=commercial",
    enabled: true,
  },
  {
    id: "warehouse",
    titleEn: formatCollectionTitleEn("Warehouse"),
    titleTh: formatCollectionTitleTh("โกดัง / โรงงาน"),
    imageUrl:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80",
    href: "/store?collection=warehouse",
    enabled: true,
  },
  {
    id: "resort",
    titleEn: formatCollectionTitleEn("Resort / Bungalow"),
    titleTh: formatCollectionTitleTh("รีสอร์ท / บังกะโล"),
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80",
    href: "/store?collection=resort",
    enabled: true,
  },
];

function newId(): string {
  return `mc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

type RawCard = Partial<MegaMenuCollectionCard> & {
  en?: string;
  th?: string;
  image?: string;
};

export function normalizeMegaMenuCollections(
  input: RawCard[] | null | undefined,
): MegaMenuCollectionCard[] {
  if (!Array.isArray(input)) {
    return DEFAULT_MEGA_MENU_COLLECTIONS.map((c) => ({ ...c }));
  }

  const defaultsById = new Map(DEFAULT_MEGA_MENU_COLLECTIONS.map((c) => [c.id, c]));

  return input.slice(0, MAX_MEGA_MENU_COLLECTIONS).map((raw, index) => {
    const fallback = DEFAULT_MEGA_MENU_COLLECTIONS[index] ?? DEFAULT_MEGA_MENU_COLLECTIONS[0];
    const id = typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : newId();
    const byId = defaultsById.get(id);
    const rawHref = (raw.href ?? "").trim();
    // Bare "/store" loses the collection filter — restore the taxonomy href.
    const href =
      rawHref && rawHref !== "/store"
        ? rawHref
        : byId?.href || `/store?collection=${encodeURIComponent(id)}`;

    const rawEn = (raw.titleEn ?? raw.en ?? "").trim();
    const rawTh = (raw.titleTh ?? raw.th ?? "").trim();

    return {
      id,
      imageUrl: (raw.imageUrl ?? raw.image ?? "").trim() || byId?.imageUrl || fallback.imageUrl,
      // Sanitize legacy "แบบบ้านโกดัง" etc. saved in site_settings
      titleEn: formatCollectionTitleEn(rawEn || byId?.titleEn || "Untitled"),
      titleTh: formatCollectionTitleTh(rawTh || byId?.titleTh || "ไม่มีชื่อ"),
      href,
      enabled: raw.enabled !== false,
    };
  });
}

export function visibleMegaMenuCollections(
  cards: MegaMenuCollectionCard[],
): MegaMenuCollectionCard[] {
  return cards.filter((c) => c.enabled).slice(0, MAX_MEGA_MENU_COLLECTIONS);
}

export function createEmptyMegaMenuCollection(): MegaMenuCollectionCard {
  return {
    id: newId(),
    imageUrl: "",
    titleEn: "New collection",
    titleTh: "คอลเลกชันใหม่",
    href: "/store",
    enabled: true,
  };
}
