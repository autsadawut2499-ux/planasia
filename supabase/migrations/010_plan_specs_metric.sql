-- Metric structural specs + construction-cost estimate for content-based matching
-- (width/length in metres, estimated build cost in THB). Nullable so existing
-- listings keep working; the recommender skips absent dimensions gracefully.
alter table public.store_listings
  add column if not exists width_meters numeric,
  add column if not exists length_meters numeric,
  add column if not exists construction_cost_estimate numeric;
