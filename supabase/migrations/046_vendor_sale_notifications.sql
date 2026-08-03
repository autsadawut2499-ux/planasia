-- Post-sale designer alerts (SMS / push / email) — idempotency log per order owner.
-- Mapping path: cart_orders.items.listingId → store_listings.owner_id → vendor_profiles.contact_phone

create table if not exists public.vendor_sale_notifications (
  id text primary key,
  cart_order_id text not null,
  owner_key text not null,
  listing_ids text[] not null default '{}',
  plan_codes text[] not null default '{}',
  phone_e164 text,
  sms_status text not null default 'pending'
    check (sms_status in ('pending', 'sent', 'skipped', 'failed')),
  sms_error text,
  push_status text not null default 'pending'
    check (push_status in ('pending', 'sent', 'skipped', 'failed')),
  email_status text not null default 'pending'
    check (email_status in ('pending', 'sent', 'skipped', 'failed')),
  created_at timestamptz not null default now(),
  unique (cart_order_id, owner_key)
);

create index if not exists vendor_sale_notifications_owner_idx
  on public.vendor_sale_notifications (owner_key, created_at desc);

alter table public.vendor_sale_notifications enable row level security;
