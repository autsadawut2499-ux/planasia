-- Vendor listing package assets: CAD/DWG, calculation sheets, designer BOQ price.
-- Idempotent — mirrors remote migration vendor_listing_cad_calc_boq_price (20260803021225).

alter table public.store_listings
  add column if not exists cad_file_urls text[] not null default '{}',
  add column if not exists calc_sheet_urls text[] not null default '{}',
  add column if not exists boq_price numeric;

-- Older remote apply may have left arrays nullable; harden defaults.
update public.store_listings
   set cad_file_urls = coalesce(cad_file_urls, '{}')
 where cad_file_urls is null;

update public.store_listings
   set calc_sheet_urls = coalesce(calc_sheet_urls, '{}')
 where calc_sheet_urls is null;

alter table public.store_listings
  alter column cad_file_urls set default '{}',
  alter column calc_sheet_urls set default '{}';

alter table public.store_listings
  alter column cad_file_urls set not null,
  alter column calc_sheet_urls set not null;

comment on column public.store_listings.cad_file_urls is
  'Private AutoCAD/DWG (or DXF) delivery file refs — never expose URLs to anon SELECT.';
comment on column public.store_listings.calc_sheet_urls is
  'Optional structural calculation sheet refs (PDF/XLS/XLSX/CSV) — private.';
comment on column public.store_listings.boq_price is
  'Designer-set BOQ add-on price in THB. Null = use platform default BOQ_BUNDLE_PRICE.';
