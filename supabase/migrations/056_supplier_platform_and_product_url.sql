-- Platform vs custom suppliers + product marketplace URL on listings.

alter table public.suppliers
  add column if not exists kind text not null default 'custom',
  add column if not exists slug text;

alter table public.suppliers
  drop constraint if exists suppliers_kind_check;

alter table public.suppliers
  add constraint suppliers_kind_check
  check (kind in ('platform', 'custom'));

-- Existing seeded general suppliers stay editable.
update public.suppliers
set kind = 'custom'
where kind is null or kind = '';

-- Fixed marketplace platforms (cannot rename/delete).
insert into public.suppliers (name, kind, slug)
select v.name, 'platform', v.slug
from (values
  ('Shopee', 'shopee'),
  ('Lazada', 'lazada')
) as v(name, slug)
where not exists (
  select 1 from public.suppliers s
  where s.slug = v.slug or lower(trim(s.name)) = lower(trim(v.name))
);

update public.suppliers
set kind = 'platform', slug = 'shopee', name = 'Shopee'
where lower(trim(name)) = 'shopee' or slug = 'shopee';

update public.suppliers
set kind = 'platform', slug = 'lazada', name = 'Lazada'
where lower(trim(name)) = 'lazada' or slug = 'lazada';

create unique index if not exists suppliers_slug_unique
  on public.suppliers (slug)
  where slug is not null;

alter table public.store_listings
  add column if not exists product_url text;

comment on column public.store_listings.product_url is
  'Marketplace product URL when supplier is Shopee/Lazada (admin order fulfillment).';
