-- Plan export files (PDF / CAD) — public bucket for store listings + re-download

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'plan-exports',
  'plan-exports',
  true,
  104857600,
  array['application/pdf', 'application/dxf', 'application/octet-stream', 'text/plain']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.export_jobs
  add column if not exists storage_path text,
  add column if not exists storage_public_url text;
