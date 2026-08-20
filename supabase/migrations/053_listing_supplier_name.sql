-- Supplier / source name for admin-listed house plans (LINE OA routing later).
-- Replaces the previous "service province" role on admin product forms.

alter table public.store_listings
  add column if not exists supplier_name text;

comment on column public.store_listings.supplier_name is
  'Supplier / source name for admin-sourced plans (LINE OA notifications).';

-- Best-effort backfill from legacy province values (IDs or free text).
update public.store_listings
set supplier_name = nullif(trim(province), '')
where (supplier_name is null or trim(supplier_name) = '')
  and province is not null
  and trim(province) <> '';

create index if not exists store_listings_supplier_name_idx
  on public.store_listings (supplier_name)
  where supplier_name is not null;
