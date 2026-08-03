-- Optional buyer phone for SMS receipt / download link delivery
alter table public.cart_orders
  add column if not exists buyer_phone text;

comment on column public.cart_orders.buyer_phone is
  'Optional buyer mobile for SMS delivery of receipt/download links';
