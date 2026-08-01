-- P0 security: private vendor assets + hide blueprint/BOQ columns from anon/authenticated.

-- ── Private storage bucket (KYC + paid PDFs) ───────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'vendor-private',
  'vendor-private',
  false,
  104857600, -- 100MB
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No public/anon storage policies — only service_role (bypasses RLS) via Next.js.

-- ── Column privileges: strip paid attachment columns from PostgREST anon ───
-- App already omits these in rowToListing; this blocks direct anon SELECT *.
revoke select on table public.store_listings from anon, authenticated;

grant select (
  id,
  slug,
  plan_id,
  plan_code,
  plan_document_id,
  owner_id,
  creator_browser_id,
  creator_session_user_id,
  creator_ip,
  creator_workspace_session_id,
  name,
  description,
  tagline,
  pitch,
  highlights,
  beds,
  baths,
  parking,
  floors,
  area,
  style,
  collection,
  province,
  width_meters,
  length_meters,
  construction_cost_estimate,
  image,
  render_urls,
  floor_plan_urls,
  price,
  price_breakdown,
  project_snapshot,
  source,
  created_at,
  likes_count,
  views_count,
  sales_count,
  ranking_score,
  pinned,
  moderation_status
) on table public.store_listings to anon, authenticated;

-- service_role retains full access (bypasses GRANT column lists via role privilege).
grant all on table public.store_listings to service_role;
