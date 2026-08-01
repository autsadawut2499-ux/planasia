-- Marketplace: recommendation-engine signals + vendor (draftsman) directory.
-- Applied to Supabase project tkvloptwmmybyeztpluf.
-- All writes go through service-role API routes; anon reads are limited by RLS.

-- ---------------------------------------------------------------------------
-- 1. store_interactions — raw behavioural signals for the recommendation engine
--    (content-based re-ranking + item-item collaborative filtering).
-- ---------------------------------------------------------------------------
create table if not exists public.store_interactions (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  -- Stable per-user key (OAuth id or browser UUID) used to group a session's
  -- behaviour and to compute co-occurrence across users.
  viewer_key text not null,
  session_user_id text,
  browser_id text,
  event_type text not null check (event_type in ('view', 'cart', 'wishlist', 'purchase', 'chat')),
  -- Relative importance of the event (purchase > cart > wishlist > view > chat).
  weight numeric not null default 1,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_store_interactions_listing on public.store_interactions (listing_id);
create index if not exists idx_store_interactions_viewer on public.store_interactions (viewer_key);
create index if not exists idx_store_interactions_event on public.store_interactions (event_type);
create index if not exists idx_store_interactions_created on public.store_interactions (created_at desc);

alter table public.store_interactions enable row level security;
-- No anon/authenticated policies: the service role bypasses RLS, and all
-- reads/writes happen inside trusted API routes. This keeps raw behaviour private.

-- ---------------------------------------------------------------------------
-- 2. vendor_profiles — draftsman / architect directory cards (auto-published
--    when a vendor sets up their profile).
-- ---------------------------------------------------------------------------
create table if not exists public.vendor_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_key text unique not null,
  display_name text not null,
  headline text,
  bio text,
  avatar_url text,
  cover_url text,
  location text,
  specialties jsonb not null default '[]'::jsonb,
  contact_email text,
  contact_phone text,
  line_id text,
  website text,
  years_experience integer,
  is_published boolean not null default true,
  is_verified boolean not null default false,
  rating numeric,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_vendor_profiles_owner on public.vendor_profiles (owner_key);
create index if not exists idx_vendor_profiles_published on public.vendor_profiles (is_published);

alter table public.vendor_profiles enable row level security;
create policy "Public read published vendors"
  on public.vendor_profiles for select
  using (is_published = true);

-- ---------------------------------------------------------------------------
-- 3. store_listings moderation + categorisation columns for AI plan screening.
-- ---------------------------------------------------------------------------
alter table public.store_listings
  add column if not exists moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  add column if not exists collection text,
  add column if not exists ai_screening jsonb;

create index if not exists idx_store_listings_moderation on public.store_listings (moderation_status);
create index if not exists idx_store_listings_collection on public.store_listings (collection);
