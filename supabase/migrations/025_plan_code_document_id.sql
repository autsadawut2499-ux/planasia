-- Marketplace plan identity: display code vs house_plans document id.
-- plan_id remains the public marketplace code (compat + unique index).
-- plan_document_id optionally links to house_plans for generative downloads.

alter table public.store_listings
  add column if not exists plan_code text,
  add column if not exists plan_document_id text;

alter table public.download_grants
  add column if not exists plan_document_id text;

-- Backfill from legacy plan_id semantics.
update public.store_listings
set plan_code = upper(plan_id)
where plan_code is null
  and plan_id ~ '^[A-Za-z]{2,5}-[0-9]+$';

update public.store_listings
set plan_document_id = plan_id
where plan_document_id is null
  and plan_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- Vendor rows: plan_id already a code — mirror into plan_code.
update public.store_listings
set plan_code = upper(plan_id)
where plan_code is null;

-- Keep plan_id aligned with marketplace code when we have one.
update public.store_listings
set plan_id = plan_code
where plan_code is not null
  and plan_id is distinct from plan_code
  and plan_document_id is not null;

create unique index if not exists store_listings_plan_code_key
  on public.store_listings (plan_code)
  where plan_code is not null;

create index if not exists store_listings_plan_document_id_idx
  on public.store_listings (plan_document_id)
  where plan_document_id is not null;
