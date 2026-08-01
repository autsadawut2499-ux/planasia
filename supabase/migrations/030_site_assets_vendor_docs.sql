-- Allow vendor blueprint PDFs in site-assets (superseded by 031 for final MIME set).
-- Kept for migration history; 031 locks documents to application/pdf only.
update storage.buckets
set
  file_size_limit = 31457280,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    'application/pdf'
  ]
where id = 'site-assets';
