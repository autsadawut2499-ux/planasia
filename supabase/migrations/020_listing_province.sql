-- Province the design is intended for / where the draftsman operates.
-- Stored as the slug id from src/lib/geo/th-provinces.ts so it can back a filter.

alter table public.store_listings
  add column if not exists province text;

create index if not exists store_listings_province_idx
  on public.store_listings (province);
