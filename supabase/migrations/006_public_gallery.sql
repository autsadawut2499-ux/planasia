-- Public gallery of AI-generated renders (view-only on /gallery; full-res download via owner API)

create table if not exists public.public_gallery_items (
  id uuid primary key default gen_random_uuid(),
  work_id text not null,
  owner_key text not null,
  project_name text not null default '',
  style_id text not null default '',
  style_label text not null default '',
  perspective_storage_path text not null,
  facade_storage_path text not null,
  perspective_public_url text not null,
  facade_public_url text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_key, work_id)
);

create index if not exists idx_public_gallery_items_created
  on public.public_gallery_items (created_at desc);

alter table public.public_gallery_items enable row level security;

-- Service role only — public reads go through Next.js API routes
