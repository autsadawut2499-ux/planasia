-- Buyer accounts captured via Google Login (NextAuth)
create table if not exists public.customers (
  id text primary key, -- Google subject (NextAuth user id / JWT sub)
  email text not null,
  name text,
  image_url text,
  last_login_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists customers_email_uidx
  on public.customers (lower(email));

create index if not exists customers_last_login_idx
  on public.customers (last_login_at desc);

alter table public.customers enable row level security;

comment on table public.customers is
  'Buyer accounts from Google Login — used for checkout identity and re-downloads';

create index if not exists download_grants_user_id_expires_idx
  on public.download_grants (user_id, expires_at desc)
  where user_id is not null;
