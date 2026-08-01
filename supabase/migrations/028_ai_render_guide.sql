-- AI Rendering Guide: 5 prompt sets + 5 before/after house image sets (admin-managed).
-- Images are stored in the existing public `site-assets` bucket under `ai-guide/…`.

create table if not exists public.ai_render_guide_prompts (
  id text primary key,
  sort_order integer not null,
  title text not null default '',
  content text not null default '',
  updated_at timestamptz not null default now(),
  constraint ai_render_guide_prompts_sort_unique unique (sort_order)
);

create table if not exists public.ai_render_guide_images (
  id text primary key,
  sort_order integer not null,
  title text not null default '',
  before_url text not null default '',
  after_url text not null default '',
  updated_at timestamptz not null default now(),
  constraint ai_render_guide_images_sort_unique unique (sort_order)
);

comment on table public.ai_render_guide_prompts is
  'Admin-managed prompt packs (5 slots) for draftsman AI Rendering Guide';
comment on table public.ai_render_guide_images is
  'Admin-managed before/after house image pairs (5 slots) for draftsman AI Rendering Guide';

-- Seed fixed 5 slots (upsert-safe).
insert into public.ai_render_guide_prompts (id, sort_order, title, content)
values
  ('prompt-1', 1, 'พร้อมพ์ตชุดที่ 1', ''),
  ('prompt-2', 2, 'พร้อมพ์ตชุดที่ 2', ''),
  ('prompt-3', 3, 'พร้อมพ์ตชุดที่ 3', ''),
  ('prompt-4', 4, 'พร้อมพ์ตชุดที่ 4', ''),
  ('prompt-5', 5, 'พร้อมพ์ตชุดที่ 5', '')
on conflict (id) do nothing;

insert into public.ai_render_guide_images (id, sort_order, title, before_url, after_url)
values
  ('image-1', 1, 'ตัวอย่างเรนเดอร์ชุดที่ 1', '', ''),
  ('image-2', 2, 'ตัวอย่างเรนเดอร์ชุดที่ 2', '', ''),
  ('image-3', 3, 'ตัวอย่างเรนเดอร์ชุดที่ 3', '', ''),
  ('image-4', 4, 'ตัวอย่างเรนเดอร์ชุดที่ 4', '', ''),
  ('image-5', 5, 'ตัวอย่างเรนเดอร์ชุดที่ 5', '', '')
on conflict (id) do nothing;

alter table public.ai_render_guide_prompts enable row level security;
alter table public.ai_render_guide_images enable row level security;

-- Public read (guide is shown on draftsman dashboard).
drop policy if exists "ai_render_guide_prompts_public_read" on public.ai_render_guide_prompts;
create policy "ai_render_guide_prompts_public_read"
  on public.ai_render_guide_prompts for select
  using (true);

drop policy if exists "ai_render_guide_images_public_read" on public.ai_render_guide_images;
create policy "ai_render_guide_images_public_read"
  on public.ai_render_guide_images for select
  using (true);

-- Writes go through service-role admin APIs only (no anon insert/update/delete policies).
