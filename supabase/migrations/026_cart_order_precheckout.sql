-- Buyer + document language fields for pre-checkout workflow.
alter table public.cart_orders
  add column if not exists buyer_name text,
  add column if not exists buyer_email text,
  add column if not exists document_language text,
  add column if not exists language_surcharge numeric not null default 0;

comment on column public.cart_orders.document_language is
  'Selected plan document language (th, en, lo, …) from pre-checkout';
