-- Restrict site-assets document uploads to PDF only.
-- Keep standard image types for CMS / renders / logos; drop Excel, CSV, HEIC.
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
