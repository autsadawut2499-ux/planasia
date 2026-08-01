-- Atomic per-style plan codes (MOD-001, MIN-002, …).
-- Vendors never invent these; the API allocates one on first save.

create table if not exists public.plan_code_counters (
  prefix text primary key,
  last_value integer not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.allocate_plan_code(p_prefix text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  clean text;
  next_val integer;
begin
  clean := upper(regexp_replace(coalesce(p_prefix, 'CUS'), '[^A-Z0-9]', '', 'g'));
  if length(clean) < 2 then
    clean := 'CUS';
  elsif length(clean) > 4 then
    clean := left(clean, 3);
  end if;

  insert into public.plan_code_counters as c (prefix, last_value, updated_at)
  values (clean, 1, now())
  on conflict (prefix) do update
    set last_value = c.last_value + 1,
        updated_at = now()
  returning c.last_value into next_val;

  return clean || '-' || lpad(next_val::text, 3, '0');
end;
$$;

revoke all on function public.allocate_plan_code(text) from public;
grant execute on function public.allocate_plan_code(text) to service_role;

-- Public plan codes must be unique (search / SEO / checkout).
create unique index if not exists store_listings_plan_id_key
  on public.store_listings (plan_id);
