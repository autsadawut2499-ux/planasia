-- Vendor listing submission form: richer presentation data + review/delivery
-- attachments + standards checklist.

alter table public.store_listings
  -- Presentation (shown on site)
  add column if not exists tagline text,
  add column if not exists highlights text[] not null default '{}',
  add column if not exists parking integer,
  add column if not exists render_urls text[] not null default '{}',
  -- Review / delivery attachments + checklist (vendor/admin only)
  add column if not exists boq_file_url text,
  add column if not exists permit_ready boolean not null default false,
  add column if not exists boq_complete boolean not null default false,
  add column if not exists contract_consent boolean not null default false;
