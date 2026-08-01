-- Persist buyer-selected Gemini target country + post-payment translation result.
alter table public.cart_orders
  add column if not exists target_country text,
  add column if not exists translation_status text,
  add column if not exists translation_result jsonb;

comment on column public.cart_orders.target_country is
  'Buyer-selected Gemini market country (TH, PH, …). Translation runs only after payment.';
comment on column public.cart_orders.translation_status is
  'pending | processing | completed | failed | skipped';
comment on column public.cart_orders.translation_result is
  'Post-payment Gemini translate + unit-conversion output (JSON).';
