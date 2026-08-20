-- Loan consultation PDF storage + LINE delivery tracking
alter table public.loan_consultations
  add column if not exists pdf_storage_path text,
  add column if not exists line_notified_at timestamptz,
  add column if not exists line_notify_error text;

comment on column public.loan_consultations.pdf_storage_path is
  'Private storage path (vendor-private) for generated consultation PDF';
comment on column public.loan_consultations.line_notified_at is
  'When the PDF/summary was pushed to the expert LINE destination';
comment on column public.loan_consultations.line_notify_error is
  'Last LINE delivery error message if push failed';
