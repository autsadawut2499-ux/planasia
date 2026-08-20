-- Post-payment order summary PDF (admin fulfilment)
alter table public.cart_orders
  add column if not exists order_summary_pdf_path text;

comment on column public.cart_orders.order_summary_pdf_path is
  'Private storage path of auto-generated order summary PDF after SlipMate verification';
