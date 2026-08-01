-- AI-generated SEO fields for store listings (meta + Schema.org JSON-LD).
ALTER TABLE public.store_listings
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS seo_json_ld jsonb,
  ADD COLUMN IF NOT EXISTS seo_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS seo_provider text;

COMMENT ON COLUMN public.store_listings.seo_title IS 'AI or fallback meta/OG title';
COMMENT ON COLUMN public.store_listings.seo_description IS 'AI or fallback meta/OG description';
COMMENT ON COLUMN public.store_listings.seo_json_ld IS 'Stored Schema.org RealEstateListing (+ optional Product) fragment';
COMMENT ON COLUMN public.store_listings.seo_generated_at IS 'When SEO fields were last generated';
COMMENT ON COLUMN public.store_listings.seo_provider IS 'gemini | rules';
