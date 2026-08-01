-- Dedupe buyer payment-confirmation emails (webhook + browser confirm race).
alter table public.cart_orders
  add column if not exists confirmation_email_sent_at timestamptz;

comment on column public.cart_orders.confirmation_email_sent_at is
  'Set when the Resend payment receipt / plan-file email was successfully claimed for send';
