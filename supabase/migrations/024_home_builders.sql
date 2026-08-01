-- Home building contractors (รับสร้างบ้าน)
CREATE TABLE IF NOT EXISTS public.home_builders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_person text NOT NULL DEFAULT '',
  phone text NOT NULL,
  email text NOT NULL DEFAULT '',
  line_id text NOT NULL DEFAULT '',
  service_areas text NOT NULL DEFAULT '',
  years_experience integer NOT NULL DEFAULT 0
    CHECK (years_experience >= 0 AND years_experience <= 100),
  expertise text NOT NULL DEFAULT '',
  logo_url text,
  portfolio_urls text[] NOT NULL DEFAULT '{}',
  company_certificate_url text,
  verification_document_url text,
  privacy_accepted boolean NOT NULL DEFAULT false,
  terms_accepted boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS home_builders_published_idx
  ON public.home_builders (is_published, created_at DESC)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS home_builders_status_idx
  ON public.home_builders (status, created_at DESC);

ALTER TABLE public.home_builders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published home builders" ON public.home_builders;
CREATE POLICY "Public can read published home builders"
  ON public.home_builders
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true AND status = 'approved');

COMMENT ON TABLE public.home_builders IS
  'รับสร้างบ้าน contractor profiles and registration applications';
