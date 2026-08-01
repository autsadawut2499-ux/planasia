-- Vendor workflow upgrade
--   1. Unlimited blueprint / BOQ attachments per listing (arrays replace the
--      single-file columns, which are kept in sync for backwards compatibility).
--   2. Brand identity images on the public draftsman profile.

alter table public.store_listings
  add column if not exists blueprint_pdf_urls text[] not null default '{}',
  add column if not exists boq_file_urls text[] not null default '{}';

-- Backfill the arrays from the legacy single-file columns.
update public.store_listings
   set blueprint_pdf_urls = array[blueprint_pdf_url]
 where blueprint_pdf_url is not null
   and coalesce(array_length(blueprint_pdf_urls, 1), 0) = 0;

update public.store_listings
   set boq_file_urls = array[boq_file_url]
 where boq_file_url is not null
   and coalesce(array_length(boq_file_urls, 1), 0) = 0;

alter table public.vendor_profiles
  -- Square brand logo shown next to the studio name.
  add column if not exists brand_image_url text,
  -- Showcase images displayed on the public profile.
  add column if not exists gallery_urls text[] not null default '{}';
