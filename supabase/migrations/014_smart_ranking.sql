-- Smart Ranking Algorithm: engagement counters + cached weighted/time-decayed
-- score + admin pin. Home page reads the pre-computed ranking_score (fast),
-- recomputed hourly by a scheduler / lazy refresh.

alter table public.store_listings
  add column if not exists likes_count integer not null default 0,
  add column if not exists views_count integer not null default 0,
  add column if not exists sales_count integer not null default 0,
  add column if not exists ranking_score double precision not null default 0,
  add column if not exists ranking_updated_at timestamptz,
  add column if not exists pinned boolean not null default false,
  add column if not exists pinned_at timestamptz;

-- Ordering index: pinned first, then by cached score.
create index if not exists idx_store_listings_ranking
  on public.store_listings (pinned desc, ranking_score desc);

-- Atomic engagement counter increment (called on view / like / sale).
create or replace function public.increment_listing_counter(p_listing_id text, p_field text)
returns void
language plpgsql
as $$
begin
  if p_field = 'likes' then
    update public.store_listings set likes_count = likes_count + 1 where id = p_listing_id;
  elsif p_field = 'views' then
    update public.store_listings set views_count = views_count + 1 where id = p_listing_id;
  elsif p_field = 'sales' then
    update public.store_listings set sales_count = sales_count + 1 where id = p_listing_id;
  end if;
end;
$$;

-- Recompute weighted + time-decayed score for every listing.
--   raw   = likes*w_like + views*w_view + sales*w_sales + 1  (+1 keeps fresh
--           zero-interaction plans discoverable)
--   score = raw / (age_hours + 2) ^ gravity   (Hacker-News style decay)
create or replace function public.recompute_ranking_scores(
  w_like double precision default 1,
  w_view double precision default 0.1,
  w_sales double precision default 5,
  gravity double precision default 1.5
)
returns integer
language plpgsql
as $$
declare
  updated integer;
begin
  update public.store_listings set
    ranking_score = ((likes_count * w_like) + (views_count * w_view) + (sales_count * w_sales) + 1)
      / power(greatest(extract(epoch from (now() - created_at)) / 3600.0, 0) + 2, gravity),
    ranking_updated_at = now()
  where id is not null; -- Supabase blocks UPDATE without a WHERE clause
  get diagnostics updated = row_count;
  return updated;
end;
$$;
