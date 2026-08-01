/**
 * Central store taxonomy — single source of truth for the header dropdowns,
 * store filters and the vendor submission form. Bilingual (en / th).
 */

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
  { id: "single-storey", en: "Single-Storey Houses", th: "บ้านชั้นเดียว" },
  { id: "two-storey", en: "Two-Storey Houses", th: "บ้านสองชั้น" },
  { id: "small", en: "Small / Narrow Houses", th: "บ้านขนาดเล็ก / หน้าแคบ" },
  { id: "commercial", en: "Commercial Building", th: "อาคารพาณิชย์ / ตึกแถว" },
  { id: "warehouse", en: "Warehouse / Factory", th: "โกดัง / โรงงาน" },
  { id: "resort", en: "Resort / Bungalow", th: "รีสอร์ท / บังกะโล" },
];

/**
 * 10 style slots. `id` matches the `style` column and the ?style= filter.
 * Copy/imagery can be enriched later without touching the header.
 */
export const STYLES: TaxonomyItem[] = [
  { id: "modern", en: "Modern", th: "โมเดิร์น" },
  { id: "contemporary", en: "Contemporary", th: "คอนเทมโพรารี" },
  { id: "minimal", en: "Minimal", th: "มินิมอล" },
  { id: "tropical", en: "Tropical", th: "ทรอปิคอล" },
  { id: "nordic", en: "Nordic / Scandinavian", th: "นอร์ดิก / สแกนดิเนเวียน" },
  { id: "loft", en: "Loft", th: "ลอฟท์" },
  { id: "classic", en: "Classic", th: "คลาสสิก" },
  { id: "muji", en: "Muji / Japanese", th: "มูจิ / ญี่ปุ่น" },
  { id: "industrial", en: "Industrial", th: "อินดัสเทรียล" },
  { id: "custom", en: "Custom / Other", th: "อื่นๆ / ตามสั่ง" },
];

/**
 * Plan types (blueprint categories) — reserved. Populate later; the header
 * renders a "coming soon" placeholder while this is empty.
 */
export const PLAN_TYPES: TaxonomyItem[] = [];

export function findTaxonomyItem(items: TaxonomyItem[], id: string): TaxonomyItem | undefined {
  return items.find((i) => i.id === id);
}
