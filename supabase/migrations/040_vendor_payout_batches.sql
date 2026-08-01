-- P1: Manual payout ops — audit when earnings flip to paid_out.

alter table public.vendor_earnings
  add column if not exists paid_out_at timestamptz,
  add column if not exists paid_out_by text,
  add column if not exists payout_batch_id text,
  add column if not exists payout_note text;

create table if not exists public.vendor_payout_batches (
  id text primary key,
  created_at timestamptz not null default now(),
  created_by text not null,
  note text,
  owner_keys text[] not null default '{}',
  earning_ids text[] not null default '{}',
  vendor_total_thb numeric not null default 0,
  line_count integer not null default 0
);

create index if not exists idx_vendor_earnings_payout_batch
  on public.vendor_earnings (payout_batch_id)
  where payout_batch_id is not null;

create index if not exists idx_vendor_payout_batches_created
  on public.vendor_payout_batches (created_at desc);

alter table public.vendor_payout_batches enable row level security;
-- No public policies — service_role only.
