-- Draftsman's own pitch / story for a listing. Shown to buyers as a signed
-- note from the designer, separate from the factual description.

alter table public.store_listings
  add column if not exists pitch text;
