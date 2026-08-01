-- Tie download grants to marketplace listings + per-file index for vendor PDFs.
alter table public.download_grants
  add column if not exists listing_id text,
  add column if not exists file_index integer not null default 0;

create index if not exists idx_download_grants_listing_id
  on public.download_grants (listing_id)
  where listing_id is not null;

comment on column public.download_grants.listing_id is
  'store_listings.id — used to resolve vendor-uploaded blueprint PDFs';
comment on column public.download_grants.file_index is
  'Index into store_listings.blueprint_pdf_urls for this grant';
