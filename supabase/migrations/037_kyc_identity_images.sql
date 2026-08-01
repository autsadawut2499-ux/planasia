-- KYC identity uploads are photos (front / back / selfie), not PDF plan docs.
-- site-assets already allows image/* + application/pdf; document this for KYC.
-- verification.documents stores HTTPS image URLs (JPG/PNG/WEBP/GIF).

comment on column public.vendor_private.verification is
  'KYC package: { documents: string[] (image URLs — front, back?, selfie), note? }. Identity photos only; not PDF blueprints.';

comment on column public.vendor_private.kyc is
  'Structured identity: { legalName, docType, docNumber, countryCode, dateOfBirth?, address? }. Paired with verification.documents image URLs.';

-- Ensure bucket still accepts KYC image MIME types (idempotent).
update storage.buckets
set
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf'
  ]
where id = 'site-assets';
