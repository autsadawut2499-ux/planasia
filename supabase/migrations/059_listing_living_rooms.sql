-- Living / reception rooms for search & store filters
alter table public.store_listings
  add column if not exists living_rooms integer;

comment on column public.store_listings.living_rooms is
  'Number of living/reception rooms (ห้องรับแขก) for catalogue search filters.';
