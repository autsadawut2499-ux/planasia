-- Home loan consultation inquiries from the public form
create table if not exists public.loan_consultations (
  id text primary key,
  full_name text not null,
  phone text not null,
  email text,
  line_id text,
  province text,
  employment_type text,
  monthly_income_thb numeric,
  monthly_debt_thb numeric,
  desired_loan_thb numeric,
  down_payment_thb numeric,
  plan_interest text,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists loan_consultations_created_at_idx
  on public.loan_consultations (created_at desc);

alter table public.loan_consultations enable row level security;
