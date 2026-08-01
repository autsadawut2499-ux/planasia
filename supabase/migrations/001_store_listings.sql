-- Run in Supabase SQL Editor (project: tkvloptwmmybyeztpluf)
create table if not exists public.store_listings (
  id text primary key,
  slug text unique not null,
  plan_id text not null,
  owner_id text not null,
  creator_browser_id text not null,
  creator_session_user_id text,
  creator_ip text,
  creator_workspace_session_id text,
  name text not null,
  description text not null,
  beds integer not null,
  baths integer not null,
  floors smallint not null check (floors in (1, 2)),
  area text not null,
  style text not null,
  image text not null,
  floor_plan_urls jsonb not null default '[]'::jsonb,
  price numeric not null,
  price_breakdown jsonb,
  project_snapshot jsonb,
  source text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_store_listings_slug on public.store_listings (slug);
create index if not exists idx_store_listings_plan_id on public.store_listings (plan_id);
create index if not exists idx_store_listings_owner_id on public.store_listings (owner_id);

alter table public.store_listings enable row level security;

-- Server uses service role key; anon clients read via API routes only.
create policy "Public read store listings"
  on public.store_listings for select
  using (true);
