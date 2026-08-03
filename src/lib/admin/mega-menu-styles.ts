/**
 * Mega-menu "House Styles" tiles (header dropdown grid).
 * Stored in site_settings under key `mega_menu_styles`.
 */

import { withBanBaanPrefix } from "@/lib/store/style-label";

export const MAX_MEGA_MENU_STYLES = 16;

export interface MegaMenuStyleCard {
  id: string;
  imageUrl: string;
  titleEn: string;
  titleTh: string;
  /** Internal path e.g. /store?style=modern */
  href: string;
  /** When false, hidden on the storefront but kept in admin. */
  enabled: boolean;
}

/** Working Unsplash fallbacks (broken photo IDs replaced). */
export const DEFAULT_MEGA_MENU_STYLES: MegaMenuStyleCard[] = [
  {
    id: "modern-farmhouse",
    titleEn: withBanBaanPrefix("Modern Farmhouse"),
    titleTh: withBanBaanPrefix("โมเดิร์นฟาร์มเฮาส์"),
    imageUrl:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=480&q=80",
    href: "/store?style=modern",
    enabled: true,
  },
  {
    id: "barndominium",
    titleEn: withBanBaanPrefix("Barndominium"),
    titleTh: withBanBaanPrefix("บาร์นโดมิเนียม"),
    imageUrl:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=480&q=80",
    href: "/store?style=industrial",
    enabled: true,
  },
  {
    id: "craftsman",
    titleEn: withBanBaanPrefix("Craftsman"),
    titleTh: withBanBaanPrefix("คราฟต์สแมน"),
    imageUrl:
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=480&q=80",
    href: "/store?style=contemporary",
    enabled: true,
  },
  {
    id: "small",
    titleEn: withBanBaanPrefix("Small"),
    titleTh: withBanBaanPrefix("บ้านขนาดเล็ก"),
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=480&q=80",
    href: "/store?collection=small",
    enabled: true,
  },
  {
    id: "farmhouse",
    titleEn: withBanBaanPrefix("Farmhouse"),
    titleTh: withBanBaanPrefix("ฟาร์มเฮาส์"),
    imageUrl:
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=480&q=80",
    href: "/store?style=classic",
    enabled: true,
  },
  {
    id: "ranch",
    titleEn: withBanBaanPrefix("Ranch"),
    titleTh: withBanBaanPrefix("แรนช์"),
    imageUrl:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=480&q=80",
    href: "/store?collection=single-storey",
    enabled: true,
  },
  {
    id: "country",
    titleEn: withBanBaanPrefix("Country"),
    titleTh: withBanBaanPrefix("คันทรี"),
    imageUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=480&q=80",
    href: "/store?style=tropical",
    enabled: true,
  },
  {
    id: "modern",
    titleEn: withBanBaanPrefix("Modern"),
    titleTh: withBanBaanPrefix("โมเดิร์น"),
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=480&q=80",
    href: "/store?style=modern",
    enabled: true,
  },
  {
    id: "cottage",
    titleEn: withBanBaanPrefix("Cottage"),
    titleTh: withBanBaanPrefix("คอตเทจ"),
    imageUrl:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=480&q=80",
    href: "/store?style=muji",
    enabled: true,
  },
  {
    id: "mountain",
    titleEn: withBanBaanPrefix("Mountain"),
    titleTh: withBanBaanPrefix("เมาน์เทน"),
    imageUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=480&q=80",
    href: "/store?style=loft",
    enabled: true,
  },
  {
    id: "lake",
    titleEn: withBanBaanPrefix("Lake"),
    titleTh: withBanBaanPrefix("เลคเฮาส์"),
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=480&q=80",
    href: "/store?style=nordic",
    enabled: true,
  },
  {
    id: "traditional",
    titleEn: withBanBaanPrefix("Traditional"),
    titleTh: withBanBaanPrefix("ทราดิชันนัล"),
    imageUrl:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=480&q=80",
    href: "/store?style=classic",
    enabled: true,
  },
];

function newId(): string {
  return `ms-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

type RawCard = Partial<MegaMenuStyleCard> & {
  en?: string;
  th?: string;
  image?: string;
};

/** Normalize admin/API payload. Accepts legacy `{ en, th, image }` shape. */
export function normalizeMegaMenuStyles(
  input: RawCard[] | null | undefined,
): MegaMenuStyleCard[] {
  if (!Array.isArray(input)) {
    return DEFAULT_MEGA_MENU_STYLES.map((c) => ({ ...c }));
  }

  return input.slice(0, MAX_MEGA_MENU_STYLES).map((raw, index) => {
    const fallback = DEFAULT_MEGA_MENU_STYLES[index] ?? DEFAULT_MEGA_MENU_STYLES[0];
    const titleEn = (raw.titleEn ?? raw.en ?? "").trim() || "Untitled";
    const titleTh = (raw.titleTh ?? raw.th ?? "").trim() || "ไม่มีชื่อ";
    return {
      id: typeof raw.id === "string" && raw.id.trim() ? raw.id.trim() : newId(),
      imageUrl:
        (raw.imageUrl ?? raw.image ?? "").trim() || fallback.imageUrl,
      titleEn: withBanBaanPrefix(titleEn),
      titleTh: withBanBaanPrefix(titleTh),
      href: (raw.href ?? "").trim() || "/store",
      enabled: raw.enabled !== false,
    };
  });
}

export function visibleMegaMenuStyles(cards: MegaMenuStyleCard[]): MegaMenuStyleCard[] {
  return cards.filter((c) => c.enabled).slice(0, MAX_MEGA_MENU_STYLES);
}

export function createEmptyMegaMenuStyle(): MegaMenuStyleCard {
  return {
    id: newId(),
    imageUrl: "",
    titleEn: withBanBaanPrefix("New style"),
    titleTh: withBanBaanPrefix("สไตล์ใหม่"),
    href: "/store",
    enabled: true,
  };
}
