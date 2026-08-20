-- Public blog / articles managed from admin
create table if not exists public.articles (
  id text primary key,
  slug text not null unique,
  title text not null,
  content text not null default '',
  featured_image_url text,
  excerpt text,
  is_published boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by text
);

create index if not exists articles_published_idx
  on public.articles (is_published, published_at desc nulls last);

create index if not exists articles_updated_at_idx
  on public.articles (updated_at desc);

alter table public.articles enable row level security;

comment on table public.articles is
  'Blog articles managed in admin; public pages list published rows only.';
