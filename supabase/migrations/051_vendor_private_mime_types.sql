-- Allow DWG + ZIP in private vendor uploads (blueprints/CAD packages).
-- (Earlier draft of this migration also created listing_reports; that feature was removed.)

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/acad',
  'application/x-acad',
  'application/autocad_dwg',
  'application/dwg',
  'application/x-dwg',
  'image/vnd.dwg',
  'application/octet-stream'
]
where id = 'vendor-private';
