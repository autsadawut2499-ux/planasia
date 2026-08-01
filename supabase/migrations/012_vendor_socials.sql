-- Social / external profile URLs for architects (schema.org sameAs — sends the
-- strongest E-E-A-T / entity-disambiguation signal to Google's Knowledge Graph).
alter table public.vendor_profiles
  add column if not exists socials jsonb not null default '[]'::jsonb;
