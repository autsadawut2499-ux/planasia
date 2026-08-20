-- Admin note: original / supplier-side house plan code.

alter table public.store_listings
  add column if not exists source_plan_code text;

comment on column public.store_listings.source_plan_code is
  'Admin note: original house plan code from supplier / source marketplace.';
