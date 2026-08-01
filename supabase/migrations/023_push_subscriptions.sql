-- Web Push subscriptions for draftsmen (PWA).
-- Linked by owner_key — the same id used on vendor_profiles / store_listings.
-- Service role writes from the API; clients never talk to this table directly.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_key text not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (endpoint)
);

create index if not exists push_subscriptions_owner_idx
  on public.push_subscriptions (owner_key);

alter table public.push_subscriptions enable row level security;
