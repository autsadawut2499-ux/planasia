-- Bank transfer + automatic slip verification
alter table public.cart_orders
  drop constraint if exists cart_orders_status_check;

alter table public.cart_orders
  add column if not exists payment_method text,
  add column if not exists slip_image_path text,
  add column if not exists slip_verify_status text,
  add column if not exists slip_verify_payload jsonb,
  add column if not exists slip_verified_at timestamptz,
  add column if not exists payment_failure_reason text;

update public.cart_orders
set status = 'awaiting_payment'
where status = 'pending';

alter table public.cart_orders
  add constraint cart_orders_status_check
  check (status in ('pending', 'awaiting_payment', 'paid', 'failed'));

alter table public.cart_orders
  alter column status set default 'awaiting_payment';

comment on column public.cart_orders.payment_method is
  'Buyer payment channel: bank_transfer';
comment on column public.cart_orders.slip_image_path is
  'Private storage path of uploaded transfer slip';
comment on column public.cart_orders.slip_verify_status is
  'verified | invalid | error | pending';
