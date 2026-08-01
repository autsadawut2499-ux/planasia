-- Admin CMS: site settings, content sections, admin users, site assets bucket

create table if not exists public.admin_users (
  email text primary key,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text
);

create table if not exists public.cms_sections (
  id text primary key,
  section text not null,
  locale text not null default 'en',
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by text,
  unique (section, locale)
);

create index if not exists idx_cms_sections_section on public.cms_sections (section);
create index if not exists idx_cms_sections_locale on public.cms_sections (locale);

-- Site assets bucket for logos, banners, admin uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
on conflict (id) do nothing;

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.cms_sections enable row level security;

-- Service role bypasses RLS; no public policies needed
