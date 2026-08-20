-- Middleman margin ledger: capture cost + profit on each paid sale.

alter table public.vendor_earnings
  add column if not exists cost_thb numeric,
  add column if not exists profit_thb numeric,
  add column if not exists plan_code text,
  add column if not exists listing_name text,
  add column if not exists supplier_name text;

comment on column public.vendor_earnings.cost_thb is
  'Supplier cost snapshot (THB) at sale time from store_listings.cost_price.';
comment on column public.vendor_earnings.profit_thb is
  'Profit = gross_thb − cost_thb at sale time.';

-- Best-effort backfill for older commission rows (treat platform share as profit).
update public.vendor_earnings
set
  cost_thb = coalesce(cost_thb, greatest(0, gross_thb - platform_amount_thb)),
  profit_thb = coalesce(profit_thb, platform_amount_thb)
where cost_thb is null or profit_thb is null;
