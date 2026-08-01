-- Drop remaining unused Pazado commerce leftovers + harden function search_path.

drop table if exists public.inventory_items cascade;
drop table if exists public.product_prices cascade;
drop table if exists public.price_lists cascade;

drop function if exists public.enforce_product_leaf_category() cascade;
drop function if exists public.on_product_created() cascade;

-- Harden mutable search_path on retained helpers (advisor WARN).
do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'set_updated_at',
        'increment_listing_counter',
        'recompute_ranking_scores'
      )
  loop
    execute format('alter function %s set search_path = public', r.sig);
  end loop;
end $$;
