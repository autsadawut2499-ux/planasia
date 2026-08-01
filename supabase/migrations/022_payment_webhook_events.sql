-- Audit trail for payment provider webhooks ("สายสืบอัตโนมัติ").
-- event_id is the provider's unique id (Stripe evt_…) so retries are idempotent.

create table if not exists public.payment_webhook_events (
  event_id text primary key,
  provider text not null default 'stripe',
  event_type text not null,
  stripe_session_id text,
  cart_order_id text,
  plan_ids text[] not null default '{}',
  amount_total integer,
  currency text,
  status text not null default 'received'
    check (status in ('received', 'fulfilled', 'ignored', 'failed')),
  payload jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists payment_webhook_events_session_idx
  on public.payment_webhook_events (stripe_session_id);

create index if not exists payment_webhook_events_created_idx
  on public.payment_webhook_events (created_at desc);
