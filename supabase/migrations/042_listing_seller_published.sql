-- Seller-controlled visibility: hide from public store without deleting.
-- Independent of admin moderation_status (pending / approved / rejected).
alter table public.store_listings
  add column if not exists is_published boolean not null default true;

comment on column public.store_listings.is_published is
  'Vendor hide/unpublish flag. false = hidden from public store; row kept for edit/republish.';

create index if not exists store_listings_is_published_idx
  on public.store_listings (is_published)
  where is_published = true;
