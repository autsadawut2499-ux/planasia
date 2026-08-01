-- Shipping address for hardcopy-3sets physical delivery.
alter table public.cart_orders
  add column if not exists shipping_address jsonb;

comment on column public.cart_orders.shipping_address is
  'Buyer shipping address JSON when hardcopy-3sets addon is selected';
