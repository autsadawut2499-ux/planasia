-- Master suppliers for admin middleman catalogue + LINE OA routing later.

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_name_not_blank check (char_length(trim(name)) between 1 and 120)
);

create unique index if not exists suppliers_name_unique_ci
  on public.suppliers (lower(trim(name)));

create index if not exists suppliers_created_at_idx
  on public.suppliers (created_at desc);

alter table public.suppliers enable row level security;

-- Seed default suppliers (idempotent).
insert into public.suppliers (name)
select v.name
from (values ('aphouse'), ('โกดังแบบบ้าน 95')) as v(name)
where not exists (
  select 1 from public.suppliers s where lower(trim(s.name)) = lower(trim(v.name))
);

-- Link store_listings → suppliers.
alter table public.store_listings
  add column if not exists supplier_id uuid references public.suppliers (id) on delete set null;

create index if not exists store_listings_supplier_id_idx
  on public.store_listings (supplier_id)
  where supplier_id is not null;

comment on column public.store_listings.supplier_id is
  'FK to public.suppliers — preferred over free-text supplier_name.';

-- Backfill supplier rows from existing free-text names, then link listings.
insert into public.suppliers (name)
select distinct trim(sl.supplier_name)
from public.store_listings sl
where sl.supplier_name is not null
  and trim(sl.supplier_name) <> ''
  and not exists (
    select 1
    from public.suppliers s
    where lower(trim(s.name)) = lower(trim(sl.supplier_name))
  );

update public.store_listings sl
set supplier_id = s.id
from public.suppliers s
where sl.supplier_id is null
  and sl.supplier_name is not null
  and lower(trim(sl.supplier_name)) = lower(trim(s.name));

-- Keep denormalized supplier_name in sync when supplier_id is known.
update public.store_listings sl
set supplier_name = s.name
from public.suppliers s
where sl.supplier_id = s.id
  and (sl.supplier_name is distinct from s.name);
