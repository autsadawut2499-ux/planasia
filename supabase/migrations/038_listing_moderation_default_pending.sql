-- New uploads default to pending (visible, Buy locked) until admin Approve.
alter table public.store_listings
  alter column moderation_status set default 'pending';

comment on column public.store_listings.moderation_status is
  'pending = visible on store, purchase locked; approved = Buy unlocked; rejected = hidden';
