-- Site plan details collected at checkout when site-plan addon is selected
alter table public.cart_orders
  add column if not exists site_plan_info jsonb;

comment on column public.cart_orders.site_plan_info is
  'Site plan (แผนผังบริเวณ) details: province, district, land title deed number';
