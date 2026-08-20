-- Estimated construction budget from loan consultation form
alter table public.loan_consultations
  add column if not exists construction_budget_thb numeric;

comment on column public.loan_consultations.construction_budget_thb is
  'Estimated house construction budget (THB) from consultation form.';
