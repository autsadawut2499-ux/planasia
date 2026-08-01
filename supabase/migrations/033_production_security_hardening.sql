-- Production security: RLS on active tables, drop unused Pazado commerce leftovers,
-- revoke public execute on allocate_plan_code.

-- ── Active tables that must not be anon-readable ───────────────────────────
alter table if exists public.payment_webhook_events enable row level security;
alter table if exists public.plan_code_counters enable row level security;

-- No public policies → only service_role (bypasses RLS) can access.

-- ── Revoke plan-code RPC from API roles (service_role only) ────────────────
revoke all on function public.allocate_plan_code(text) from public;
revoke all on function public.allocate_plan_code(text) from anon;
revoke all on function public.allocate_plan_code(text) from authenticated;
grant execute on function public.allocate_plan_code(text) to service_role;

-- ── Drop unused SECURITY DEFINER views (legacy Pazado storefront) ──────────
drop view if exists public.v_storefront_products cascade;
drop view if exists public.v_product_image_gallery cascade;
drop view if exists public.v_admin_selectable_categories cascade;
drop view if exists public.categories_with_depth cascade;

-- ── Drop unused Pazado product / warehouse tables ──────────────────────────
drop table if exists public.stock_movements cascade;
drop table if exists public.product_tags cascade;
drop table if exists public.product_specifications cascade;
drop table if exists public.product_images cascade;
drop table if exists public.products cascade;
drop table if exists public.warehouses cascade;
drop table if exists public.brands cascade;
drop table if exists public.tags cascade;
-- categories may still be referenced by old seed scripts; lock with RLS instead of dropping
alter table if exists public.categories enable row level security;
