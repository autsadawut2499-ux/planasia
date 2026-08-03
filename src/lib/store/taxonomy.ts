/**
 * Central store taxonomy — single source of truth for the header dropdowns,
 * store filters and the vendor submission form. Bilingual (en / th).
 *
 * Style labels always start with "แบบบ้าน" for storefront display.
 */

import { withBanBaanPrefix } from "@/lib/store/style-label";

export interface TaxonomyItem {
  /** Filter value used in ?style= / ?collection= query params + DB column. */
  id: string;
  en: string;
  th: string;
  /** Placeholder slot: shown in menus but not yet populated with plans. */
  comingSoon?: boolean;
}

/**
 * Collections / building types already present in the system. `id` matches the
 * `collection` column on store_listings and the vendor form values.
 */
export const COLLECTIONS: TaxonomyItem[] = [
  {
    id: "single-storey",
    en: withBanBaanPrefix("Single-Storey Houses"),
    th: withBanBaanPrefix("บ้านชั้นเดียว"),
  },
  {
    id: "two-storey",
    en: withBanBaanPrefix("Two-Storey Houses"),
    th: withBanBaanPrefix("บ้านสองชั้น"),
  },
  {
    id: "small",
    en: withBanBaanPrefix("Small / Narrow Houses"),
    th: withBanBaanPrefix("บ้านขนาดเล็ก / หน้าแคบ"),
  },
  {
    id: "commercial",
    en: withBanBaanPrefix("Commercial Building"),
    th: withBanBaanPrefix("อาคารพาณิชย์ / ตึกแถว"),
  },
  {
    id: "warehouse",
    en: withBanBaanPrefix("Warehouse / Factory"),
    th: withBanBaanPrefix("โกดัง / โรงงาน"),
  },
  {
    id: "resort",
    en: withBanBaanPrefix("Resort / Bungalow"),
    th: withBanBaanPrefix("รีสอร์ท / บังกะโล"),
  },
];

/**
 * 10 style slots. `id` matches the `style` column and the ?style= filter.
 * Display labels are prefixed with "แบบบ้าน".
 */
export const STYLES: TaxonomyItem[] = [
  { id: "modern", en: withBanBaanPrefix("Modern"), th: withBanBaanPrefix("โมเดิร์น") },
  { id: "contemporary", en: withBanBaanPrefix("Contemporary"), th: withBanBaanPrefix("คอนเทมโพรารี") },
  { id: "minimal", en: withBanBaanPrefix("Minimal"), th: withBanBaanPrefix("มินิมอล") },
  { id: "tropical", en: withBanBaanPrefix("Tropical"), th: withBanBaanPrefix("ทรอปิคอล") },
  {
    id: "nordic",
    en: withBanBaanPrefix("Nordic / Scandinavian"),
    th: withBanBaanPrefix("นอร์ดิก / สแกนดิเนเวียน"),
  },
  { id: "loft", en: withBanBaanPrefix("Loft"), th: withBanBaanPrefix("ลอฟท์") },
  { id: "classic", en: withBanBaanPrefix("Classic"), th: withBanBaanPrefix("คลาสสิก") },
  { id: "muji", en: withBanBaanPrefix("Muji / Japanese"), th: withBanBaanPrefix("มูจิ / ญี่ปุ่น") },
  { id: "industrial", en: withBanBaanPrefix("Industrial"), th: withBanBaanPrefix("อินดัสเทรียล") },
  { id: "custom", en: withBanBaanPrefix("Custom / Other"), th: withBanBaanPrefix("อื่นๆ / ตามสั่ง") },
];

/**
 * Plan types (blueprint categories) — reserved. Populate later; the header
 * renders a "coming soon" placeholder while this is empty.
 */
export const PLAN_TYPES: TaxonomyItem[] = [];

export function findTaxonomyItem(items: TaxonomyItem[], id: string): TaxonomyItem | undefined {
  return items.find((i) => i.id === id);
}
