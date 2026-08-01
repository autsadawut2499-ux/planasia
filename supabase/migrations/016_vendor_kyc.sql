-- KYC (Know Your Customer) for draftsmen/architects. Extends the existing
-- vendor_private verification with structured identity data + admin review
-- metadata. Pan-Asia: capture the vendor's country on the public profile.

alter table public.vendor_private
  add column if not exists kyc jsonb,
  add column if not exists verification_reviewed_at timestamptz,
  add column if not exists verification_reviewed_by text,
  add column if not exists verification_reject_reason text;

alter table public.vendor_profiles
  add column if not exists country_code text;
