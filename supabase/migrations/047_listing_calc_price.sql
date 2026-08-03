-- Designer-set price for the structural calculation document add-on (mirrors boq_price).

alter table public.store_listings
  add column if not exists calc_price numeric;

comment on column public.store_listings.calc_price is
  'Designer-set calc-sheet add-on price (THB). Null = platform default CALC_SHEET_PRICE.';

-- Public storefront may read the price (same privilege pattern as boq_price).
grant select (calc_price) on table public.store_listings to anon, authenticated;
