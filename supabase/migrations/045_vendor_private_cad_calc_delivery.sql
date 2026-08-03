-- Align storage + grants with CAD / calc / BOQ package delivery.
-- 1) Allow DWG/DXF + spreadsheet MIME types on vendor-private
-- 2) Public-safe SELECT grants (boq_price, is_published, seo_*)
-- 3) download_grants.file_kind for blueprint | cad | boq | calc

-- ── Storage: vendor-private MIME allow-list ────────────────────────────────
update storage.buckets
   set allowed_mime_types = array[
     'image/jpeg',
     'image/png',
     'image/webp',
     'image/gif',
     'application/pdf',
     -- AutoCAD / DWG / DXF (browsers vary wildly)
     'application/acad',
     'application/x-acad',
     'application/autocad_dwg',
     'application/dwg',
     'application/x-dwg',
     'image/vnd.dwg',
     'application/dxf',
     'application/x-dxf',
     'application/octet-stream',
     -- Calc / BOQ spreadsheets
     'application/vnd.ms-excel',
     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
     'text/csv'
   ],
       file_size_limit = 104857600
 where id = 'vendor-private';

-- ── Harden listing attachment columns (if 044 not applied yet) ─────────────
alter table public.store_listings
  add column if not exists cad_file_urls text[] not null default '{}',
  add column if not exists calc_sheet_urls text[] not null default '{}',
  add column if not exists boq_price numeric;

update public.store_listings
   set cad_file_urls = coalesce(cad_file_urls, '{}')
 where cad_file_urls is null;

update public.store_listings
   set calc_sheet_urls = coalesce(calc_sheet_urls, '{}')
 where calc_sheet_urls is null;

do $$
begin
  alter table public.store_listings alter column cad_file_urls set not null;
exception when others then null;
end $$;

do $$
begin
  alter table public.store_listings alter column calc_sheet_urls set not null;
exception when others then null;
end $$;

-- ── download_grants.file_kind ──────────────────────────────────────────────
alter table public.download_grants
  add column if not exists file_kind text not null default 'blueprint';

update public.download_grants
   set file_kind = case
     when format = 'cad' then 'cad'
     else 'blueprint'
   end
 where file_kind is null
    or file_kind = 'blueprint' and format = 'cad';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'download_grants_file_kind_check'
  ) then
    alter table public.download_grants
      add constraint download_grants_file_kind_check
      check (file_kind in ('blueprint', 'cad', 'boq', 'calc'));
  end if;
end $$;

comment on column public.download_grants.file_kind is
  'Which store_listings array this grant indexes: blueprint_pdf_urls | cad_file_urls | boq_file_urls | calc_sheet_urls';
comment on column public.download_grants.file_index is
  'Index into the listing attachment array selected by file_kind';

-- ── Column privileges: public-safe fields (keep CAD/calc/BOQ URLs private) ─
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
  boq_price,
  price_breakdown,
  project_snapshot,
  source,
  created_at,
  likes_count,
  views_count,
  sales_count,
  ranking_score,
  pinned,
  moderation_status,
  is_published,
  seo_title,
  seo_description,
  seo_json_ld,
  seo_generated_at,
  seo_provider
) on table public.store_listings to anon, authenticated;

grant all on table public.store_listings to service_role;
