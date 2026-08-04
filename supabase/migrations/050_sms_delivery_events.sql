-- ThaiBulkSMS (and other providers) delivery-status webhook audit log.
-- Endpoint: POST /api/webhooks/sms-seller

create table if not exists public.sms_delivery_events (
  id text primary key,
  provider text not null default 'thaibulksms',
  message_id text,
  phone text,
  status text,
  status_code text,
  credit numeric,
  cart_order_id text,
  owner_key text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists sms_delivery_events_message_id_idx
  on public.sms_delivery_events (message_id);

create index if not exists sms_delivery_events_created_idx
  on public.sms_delivery_events (created_at desc);

alter table public.sms_delivery_events enable row level security;

-- Correlate provider message id back to sale-alert rows.
alter table public.vendor_sale_notifications
  add column if not exists sms_message_id text;

alter table public.vendor_sale_notifications
  add column if not exists sms_provider text;

create index if not exists vendor_sale_notifications_sms_message_id_idx
  on public.vendor_sale_notifications (sms_message_id)
  where sms_message_id is not null;
