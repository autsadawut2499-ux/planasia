-- Workspace persistence — replaces browser localStorage for works, assets, and previews

create table if not exists public.workspace_works (
  id text not null,
  owner_key text not null,
  name text not null,
  snapshot jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (owner_key, id)
);

create index if not exists idx_workspace_works_owner_updated
  on public.workspace_works (owner_key, updated_at desc);

create table if not exists public.workspace_owner_state (
  owner_key text primary key,
  active_work_id text,
  updated_at timestamptz not null default now()
);

alter table public.workspace_works enable row level security;
alter table public.workspace_owner_state enable row level security;

-- Public bucket — paths are owner/work scoped UUIDs (service role writes via API)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'workspace-assets',
  'workspace-assets',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
