-- Middleman catalogue fields: cost vs sell price + site-plan add-on.
-- Delivery documents are ordered from suppliers after purchase (not stored on listings).

alter table public.store_listings
  add column if not exists cost_price integer,
  add column if not exists site_plan_addon_price integer;

comment on column public.store_listings.cost_price is
  'Supplier cost for the main permit package (THB integer).';

comment on column public.store_listings.site_plan_addon_price is
  'Selling price for site-plan add-on (แผนผังบริเวณ) in THB; null = not offered / use platform default later.';

alter table public.store_listings
  drop constraint if exists store_listings_cost_price_nonneg;

alter table public.store_listings
  add constraint store_listings_cost_price_nonneg
  check (cost_price is null or cost_price >= 0);

alter table public.store_listings
  drop constraint if exists store_listings_site_plan_addon_price_nonneg;

alter table public.store_listings
  add constraint store_listings_site_plan_addon_price_nonneg
  check (site_plan_addon_price is null or site_plan_addon_price >= 0);
