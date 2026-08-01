-- Dual-image AI render projects (floor plan + front elevation → 3D outputs).
-- Named render_projects because public.projects already stores design-draft records
-- (project_type_code / input / building_spec) from migration 002.

-- Auth model (Planasia):
--   Workspace identity is owner_key (browser / NextAuth session via API headers).
--   Supabase Auth (auth.users) is NOT used for end users.
--   Therefore user_id is optional UUID with NO FK to auth.users.
--   All reads/writes go through Next.js API routes using the service role.
--   RLS enabled; client access only via auth.uid() = user_id policy (usually unused).

create table if not exists public.render_projects (
  id uuid primary key default gen_random_uuid(),
  owner_key text not null,
  user_id uuid null,
  work_id text null,
  project_name text not null,
  house_type text not null,
  style_id text null references public.architectural_styles (id) on delete set null,
  selected_materials jsonb not null default '{}'::jsonb,
  target_view text not null default 'dual'
    check (target_view in ('dual', 'floor_3d', 'facade')),
  floor_plan_url text not null,
  elevation_url text not null,
  -- Dual AI outputs (Planasia generates two images per render)
  floor_3d_url text null,
  facade_url text null,
  -- Convenience / legacy single pointer (usually floor_3d_url)
  render_output_url text null,
  render_outputs jsonb null,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text null,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists idx_render_projects_owner_created
  on public.render_projects (owner_key, created_at desc);

create index if not exists idx_render_projects_owner_work
  on public.render_projects (owner_key, work_id)
  where work_id is not null;

create index if not exists idx_render_projects_status
  on public.render_projects (status, updated_at desc);

create index if not exists idx_render_projects_style
  on public.render_projects (style_id)
  where style_id is not null;

alter table public.render_projects enable row level security;

-- Deny-by-default for anon clients. Service role bypasses RLS
-- (matches workspace_works / public_gallery). Optional policy uses user_id
-- (not user_uid) for any future Supabase Auth sessions.
create policy "Users can manage their own projects"
  on public.render_projects
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on table public.render_projects is
  'AI dual-view render jobs: floor_plan + elevation inputs → floor_3d + facade outputs. Scoped by owner_key; written via service-role API.';

comment on column public.render_projects.owner_key is
  'Workspace owner identity (browser id / NextAuth primary user id). Required.';

comment on column public.render_projects.user_id is
  'Optional UUID for future auth linking. No FK to auth.users — Planasia uses NextAuth, not Supabase Auth.';

comment on column public.render_projects.render_outputs is
  'Structured dual outputs: {"floor_3d":"<url>","facade":"<url>"}';

comment on column public.render_projects.floor_plan_url is
  'URL of 2D floor plan line art (Image A input)';

comment on column public.render_projects.elevation_url is
  'URL of front elevation (Image B input)';
