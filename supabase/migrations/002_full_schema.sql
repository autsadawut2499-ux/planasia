-- Full Planasia schema — all website data lives in Supabase
-- Applied via Supabase MCP (initial_planasia_schema)

create table if not exists public.store_listings (
  id text primary key,
  slug text unique not null,
  plan_id text not null,
  owner_id text not null,
  creator_browser_id text not null,
  creator_session_user_id text,
  creator_ip text,
  creator_workspace_session_id text,
  name text not null,
  description text not null,
  beds integer not null,
  baths integer not null,
  floors smallint not null check (floors in (1, 2)),
  area text not null,
  style text not null,
  image text not null,
  floor_plan_urls jsonb not null default '[]'::jsonb,
  price numeric not null,
  price_breakdown jsonb,
  project_snapshot jsonb,
  source text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_store_listings_slug on public.store_listings (slug);
create index if not exists idx_store_listings_plan_id on public.store_listings (plan_id);
create index if not exists idx_store_listings_owner_id on public.store_listings (owner_id);

create table if not exists public.projects (
  id text primary key,
  project_type_code text not null,
  input jsonb not null,
  building_spec jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.house_plans (
  id text primary key,
  document jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.design_drafts (
  owner_key text primary key,
  record jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.cart_orders (
  id text primary key,
  items jsonb not null default '[]'::jsonb,
  addons jsonb not null default '[]'::jsonb,
  subtotal numeric not null,
  discount numeric not null default 0,
  addon_total numeric not null default 0,
  total numeric not null,
  currency text not null default 'THB',
  buyer_user_id text,
  stripe_session_id text,
  status text not null check (status in ('pending', 'paid')),
  created_at timestamptz not null default now()
);

create index if not exists idx_cart_orders_stripe_session on public.cart_orders (stripe_session_id);

create table if not exists public.download_grants (
  token text primary key,
  plan_id text not null,
  format text not null check (format in ('pdf', 'cad')),
  user_id text,
  stripe_session_id text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists idx_download_grants_plan_id on public.download_grants (plan_id);
create index if not exists idx_download_grants_stripe_session on public.download_grants (stripe_session_id);

create table if not exists public.export_jobs (
  id text primary key,
  status text not null check (status in ('queued', 'processing', 'completed', 'failed')),
  format text not null check (format in ('pdf', 'cad')),
  plan_id text not null,
  token text not null,
  unit_system text not null,
  progress integer not null default 0,
  queue_position integer not null default 0,
  error text,
  result_filename text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create index if not exists idx_export_jobs_status_created on public.export_jobs (status, created_at);

create table if not exists public.export_job_results (
  job_id text not null references public.export_jobs(id) on delete cascade,
  format text not null check (format in ('pdf', 'cad')),
  content bytea not null,
  created_at timestamptz not null default now(),
  primary key (job_id, format)
);

create table if not exists public.translation_cache (
  cache_key text primary key,
  target_locale text not null,
  translations jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_bundle (
  id text primary key default 'default',
  schema_version integer not null,
  project_types jsonb not null,
  cost_benchmarks jsonb not null,
  permit_rules jsonb not null,
  loaded_at timestamptz not null default now()
);

alter table public.store_listings enable row level security;
alter table public.projects enable row level security;
alter table public.house_plans enable row level security;
alter table public.design_drafts enable row level security;
alter table public.cart_orders enable row level security;
alter table public.download_grants enable row level security;
alter table public.export_jobs enable row level security;
alter table public.export_job_results enable row level security;
alter table public.translation_cache enable row level security;
alter table public.catalog_bundle enable row level security;
