-- User-generated reviews (E-E-A-T signal). Verified-purchase reviews with
-- real-world photos power AggregateRating / Review rich snippets.
create table if not exists public.plan_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  author_key text not null,
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text,
  photos jsonb not null default '[]'::jsonb,
  is_verified_purchase boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_plan_reviews_listing on public.plan_reviews (listing_id);
create index if not exists idx_plan_reviews_published on public.plan_reviews (is_published);
-- One review per buyer per plan.
create unique index if not exists uq_plan_reviews_author_listing
  on public.plan_reviews (listing_id, author_key);

alter table public.plan_reviews enable row level security;
create policy "Public read published reviews"
  on public.plan_reviews for select
  using (is_published = true);
