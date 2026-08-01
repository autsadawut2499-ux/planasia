-- Vendor earnings / commission ledger.
-- Vendors set listing prices freely; on each paid sale the platform records a
-- 70% vendor / 30% platform split (amounts in base THB).

create table if not exists public.vendor_earnings (
  id text primary key,
  owner_key text not null,
  listing_id text not null,
  cart_order_id text not null,
  gross_thb numeric not null,
  vendor_amount_thb numeric not null,
  platform_amount_thb numeric not null,
  vendor_share double precision not null default 0.70,
  platform_share double precision not null default 0.30,
  currency text not null default 'THB',
  status text not null default 'pending'
    check (status in ('pending', 'available', 'paid_out')),
  created_at timestamptz not null default now()
);

create unique index if not exists uq_vendor_earnings_order_listing
  on public.vendor_earnings (cart_order_id, listing_id);

create index if not exists idx_vendor_earnings_owner
  on public.vendor_earnings (owner_key, created_at desc);

create index if not exists idx_vendor_earnings_status
  on public.vendor_earnings (status);

alter table public.vendor_earnings enable row level security;
