/**
 * Central store taxonomy — single source of truth for the header dropdowns,
 * store filters and the vendor submission form. Bilingual (en / th).
 *
 * Styles use "แบบบ้าน…" (house-style look).
 * Collections use type-correct "แบบ…" labels (แบบโกดัง, แบบอาคารพาณิชย์, …).
 */

import {
  formatCollectionTitleEn,
  formatCollectionTitleTh,
  withBanBaanPrefix,
} from "@/lib/store/style-label";

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
    en: formatCollectionTitleEn("Single-Storey Houses"),
    th: formatCollectionTitleTh("บ้านชั้นเดียว"),
  },
  {
    id: "two-storey",
    en: formatCollectionTitleEn("Two-Storey Houses"),
    th: formatCollectionTitleTh("บ้านสองชั้น"),
  },
  {
    id: "small",
    en: formatCollectionTitleEn("Small / Narrow Houses"),
    th: formatCollectionTitleTh("บ้านขนาดเล็ก / หน้าแคบ"),
  },
  {
    id: "commercial",
    en: formatCollectionTitleEn("Commercial Building"),
    th: formatCollectionTitleTh("อาคารพาณิชย์ / ตึกแถว"),
  },
  {
    id: "warehouse",
    en: formatCollectionTitleEn("Warehouse / Factory"),
    th: formatCollectionTitleTh("โกดัง / โรงงาน"),
  },
  {
    id: "resort",
    en: formatCollectionTitleEn("Resort / Bungalow"),
    th: formatCollectionTitleTh("รีสอร์ท / บังกะโล"),
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
  { id: "resort", en: withBanBaanPrefix("Resort"), th: withBanBaanPrefix("รีสอร์ท") },
  { id: "custom", en: withBanBaanPrefix("Custom / Other"), th: withBanBaanPrefix("อื่นๆ / ตามสั่ง") },
];

/**
 * Plan types (blueprint categories) — reserved. Populate later; the header
 * renders a "coming soon" placeholder while this is empty.
 */
export const PLAN_TYPES: TaxonomyItem[] = [];

/**
 * Unified style options shown in the storefront filter.
 * Non-residential building types keep their collection-style labels so
 * "แบบบ้าน…" is not forced onto warehouses, commercial, resort, etc.
 */
const STYLE_BASES: Array<Omit<TaxonomyItem, "en" | "th"> & { en: string; th: string }> = [
  { id: "modern", en: "Modern", th: "โมเดิร์น" },
  { id: "contemporary", en: "Contemporary", th: "คอนเทมโพรารี" },
  { id: "minimal", en: "Minimal", th: "มินิมอล" },
  { id: "tropical", en: "Tropical", th: "ทรอปิคอล" },
  { id: "nordic", en: "Nordic / Scandinavian", th: "นอร์ดิก / สแกนดิเนเวียน" },
  { id: "loft", en: "Loft", th: "ลอฟท์" },
  { id: "classic", en: "Classic", th: "คลาสสิก" },
  { id: "muji", en: "Muji / Japanese", th: "มูจิ / ญี่ปุ่น" },
  { id: "industrial", en: "Industrial", th: "อินดัสเทรียล" },
  { id: "single-storey", en: "Single-Storey Houses", th: "บ้านชั้นเดียว" },
  { id: "two-storey", en: "Two-Storey Houses", th: "บ้านสองชั้น" },
  { id: "small", en: "Small / Narrow Houses", th: "บ้านขนาดเล็ก / หน้าแคบ" },
  { id: "commercial", en: "Commercial Building", th: "อาคารพาณิชย์ / ตึกแถว" },
  { id: "warehouse", en: "Warehouse / Factory", th: "โกดัง / โรงงาน" },
  { id: "resort", en: "Resort / Bungalow", th: "รีสอร์ท / บังกะโล" },
  { id: "custom", en: "Custom / Other", th: "อื่นๆ / ตามสั่ง" },
];

export const ALL_STYLES: TaxonomyItem[] = STYLE_BASES.map((item) => {
  const isBuildingType = ["commercial", "warehouse", "resort"].includes(item.id);
  return {
    ...item,
    en: formatCollectionTitleEn(item.en),
    th: isBuildingType ? formatCollectionTitleTh(item.th) : withBanBaanPrefix(item.th),
  };
});

export function findTaxonomyItem(items: TaxonomyItem[], id: string): TaxonomyItem | undefined {
  return items.find((i) => i.id === id);
}
