-- Vendor Dashboard: private commercial data (bank payout + identity verification).
-- Kept in a SEPARATE table from vendor_profiles so public directory reads
-- (getPublishedVendors selects *) can never leak bank/KYC details. Written and
-- read only via the service-role key.
create table if not exists public.vendor_private (
  owner_key text primary key,
  -- { bankName, accountName, accountNumber, promptPay }
  payout jsonb not null default '{}'::jsonb,
  -- { documents: string[], note }
  verification jsonb not null default '{}'::jsonb,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'approved', 'rejected')),
  verification_submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vendor_private enable row level security;
-- No anon/authenticated policies: only the service role (which bypasses RLS)
-- may touch this table.

-- Source blueprint PDF for a listing. Not mapped into the public StoreListing
-- payload — delivered only post-purchase (watermarking handled separately).
alter table public.store_listings
  add column if not exists blueprint_pdf_url text;
