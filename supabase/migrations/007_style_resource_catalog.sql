-- Style resource catalog — flooring, facade refs, and style assets for AI rendering.
-- Distinct from public_gallery (user renders). Public-read catalog; writes via service role.

create table if not exists public.architectural_styles (
  id text primary key,
  label_en text not null,
  label_th text not null default '',
  description_en text not null default '',
  description_th text not null default '',
  prompt_label text not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.style_flooring_types (
  id uuid primary key default gen_random_uuid(),
  style_id text not null references public.architectural_styles (id) on delete cascade,
  flooring_id text not null,
  label_en text not null,
  label_th text not null default '',
  prompt_hint text not null default '',
  is_default boolean not null default false,
  sort_order integer not null default 0,
  unique (style_id, flooring_id)
);

create index if not exists idx_style_flooring_types_style
  on public.style_flooring_types (style_id, sort_order);

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'style_asset_kind'
  ) then
    create type public.style_asset_kind as enum (
      'facade_ref',
      'material',
      'texture',
      'mood',
      'other'
    );
  end if;
end $$;

create table if not exists public.style_assets (
  id uuid primary key default gen_random_uuid(),
  style_id text not null references public.architectural_styles (id) on delete cascade,
  kind public.style_asset_kind not null,
  slot_key text not null,
  label_en text not null default '',
  label_th text not null default '',
  prompt_hint text not null default '',
  storage_path text,
  public_url text,
  mime_type text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (style_id, kind, slot_key)
);

create index if not exists idx_style_assets_style_kind
  on public.style_assets (style_id, kind, sort_order)
  where active = true;

-- Public bucket for style reference binaries
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'style-assets',
  'style-assets',
  true,
  20971520,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.architectural_styles enable row level security;
alter table public.style_flooring_types enable row level security;
alter table public.style_assets enable row level security;

-- Public read (catalog is non-sensitive); writes via service role only
drop policy if exists "Public read architectural styles" on public.architectural_styles;
create policy "Public read architectural styles"
  on public.architectural_styles for select
  using (active = true);

drop policy if exists "Public read style flooring types" on public.style_flooring_types;
create policy "Public read style flooring types"
  on public.style_flooring_types for select
  using (true);

drop policy if exists "Public read style assets" on public.style_assets;
create policy "Public read style assets"
  on public.style_assets for select
  using (active = true);

-- ---------------------------------------------------------------------------
-- Seed: 5 catalog styles (IDs align with input-stage + HOUSE_STYLES)
--   minimal | scandinavian | tropical-minimal | loft | japanese
-- ---------------------------------------------------------------------------

insert into public.architectural_styles (
  id, label_en, label_th, description_en, description_th, prompt_label, sort_order
) values
  (
    'minimal',
    'Minimalist',
    'มินิมอล',
    'Clean modern minimal residential — simple volumes, restrained palette, uncluttered surfaces.',
    'บ้านโมเดิร์นมินิมอล — รูปทรงเรียบ โทนสีจำกัด พื้นผิวโล่ง',
    'Minimalist / clean modern minimal interiors and facade',
    1
  ),
  (
    'scandinavian',
    'Modern',
    'โมเดิร์น / สแกนดินาเวีย',
    'Contemporary Scandinavian-influenced residential — light woods, soft neutrals, airy daylight.',
    'บ้านร่วมสมัยแนวสแกนดินาเวีย — ไม้โทนอ่อน สีกลางสว่าง แสงธรรมชาติ',
    'Modern / contemporary Scandinavian-influenced residential',
    2
  ),
  (
    'tropical-minimal',
    'Tropical',
    'โทรปิคัล',
    'Warm modern tropical residential — indoor-outdoor flow, natural materials, shaded openness.',
    'บ้านโทรปิคัลโมเดิร์น — เชื่อมใน-นอก วัสดุธรรมชาติ เงาและช่องเปิด',
    'Tropical / warm modern tropical residential',
    3
  ),
  (
    'loft',
    'Luxury',
    'ลักซ์ชัวรี / ลอฟท์',
    'Refined luxury residential — rich materials, bold contrast, polished industrial accents.',
    'บ้านหรูแนวลอฟท์ — วัสดุพรีเมียม คอนทราสต์ชัด รายละเอียดอินดัสเทรียล',
    'Luxury / refined luxury residential architecture',
    4
  ),
  (
    'japanese',
    'Japanese',
    'ญี่ปุ่น',
    'Japanese Zen residential — calm asymmetry, natural wood, soft light, measured voids.',
    'บ้านญี่ปุ่นเซน — สมมาตรไม่สมบูรณ์ ไม้ธรรมชาติ แสงนุ่ม พื้นที่ว่าง',
    'Japanese Zen / calm natural-wood residential architecture',
    5
  )
on conflict (id) do update set
  label_en = excluded.label_en,
  label_th = excluded.label_th,
  description_en = excluded.description_en,
  description_th = excluded.description_th,
  prompt_label = excluded.prompt_label,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();

-- Flooring options per style (flooring_id aligns with FLOOR_MATERIALS.value where possible)
insert into public.style_flooring_types (
  style_id, flooring_id, label_en, label_th, prompt_hint, is_default, sort_order
) values
  -- minimal
  ('minimal', 'ceramic-porcelain', 'Ceramic / Porcelain Tile', 'กระเบื้องเซรามิค/พอร์ซเลน', 'Large-format matte porcelain in soft grey or warm white', true, 1),
  ('minimal', 'polished-concrete', 'Polished Concrete', 'คอนกรีตขัดมัน', 'Smooth light polished concrete with subtle sheen', false, 2),
  ('minimal', 'lvt-spc', 'LVT / SPC Vinyl', 'กระเบื้องยาง LVT/SPC', 'Quiet stone-look LVT in pale neutral tones', false, 3),
  ('minimal', 'laminate', 'Laminate Flooring', 'พื้นไม้ลามิเนต', 'Light oak laminate with minimal grain', false, 4),
  -- scandinavian
  ('scandinavian', 'engineered-wood', 'Engineered Wood', 'ไม้เอ็นจิเนียร์', 'Pale ash or birch engineered wood, matte finish', true, 1),
  ('scandinavian', 'laminate', 'Laminate Flooring', 'พื้นไม้ลามิเนต', 'Whitewashed wood-look laminate', false, 2),
  ('scandinavian', 'parquet', 'Parquet', 'ไม้ปาเก้', 'Light herringbone parquet, soft natural stain', false, 3),
  ('scandinavian', 'lvt-spc', 'LVT / SPC Vinyl', 'กระเบื้องยาง LVT/SPC', 'Wood-look SPC in cool blonde tones', false, 4),
  -- tropical-minimal
  ('tropical-minimal', 'ceramic-porcelain', 'Ceramic / Porcelain Tile', 'กระเบื้องเซรามิค/พอร์ซเลน', 'Warm stone-look porcelain suitable for indoor-outdoor flow', true, 1),
  ('tropical-minimal', 'engineered-wood', 'Engineered Wood', 'ไม้เอ็นจิเนียร์', 'Warm teak-toned engineered wood in living zones', false, 2),
  ('tropical-minimal', 'polished-concrete', 'Polished Concrete', 'คอนกรีตขัดมัน', 'Warm-grey polished concrete for breezy tropical floors', false, 3),
  ('tropical-minimal', 'lvt-spc', 'LVT / SPC Vinyl', 'กระเบื้องยาง LVT/SPC', 'Moisture-tolerant wood or stone LVT', false, 4),
  -- loft
  ('loft', 'polished-concrete', 'Polished Concrete / Loft Screed', 'คอนกรีตขัดมัน / ปูนลอฟท์', 'Dark or mid-grey loft screed with industrial character', true, 1),
  ('loft', 'parquet', 'Parquet', 'ไม้ปาเก้', 'Rich dark oak parquet contrasting with concrete', false, 2),
  ('loft', 'granite-marble', 'Granite / Marble', 'หินแกรนิต / หินอ่อน', 'Large-format dark stone or veined marble accents', false, 3),
  ('loft', 'ceramic-porcelain', 'Ceramic / Porcelain Tile', 'กระเบื้องเซรามิค/พอร์ซเลน', 'Large dark porcelain slab flooring', false, 4),
  -- japanese
  ('japanese', 'engineered-wood', 'Engineered Wood', 'ไม้เอ็นจิเนียร์', 'Tatami-adjacent pale cedar or cypress-toned wood', true, 1),
  ('japanese', 'parquet', 'Parquet', 'ไม้ปาเก้', 'Quiet straight-lay wood with soft natural finish', false, 2),
  ('japanese', 'laminate', 'Laminate Flooring', 'พื้นไม้ลามิเนต', 'Light natural wood-look laminate', false, 3),
  ('japanese', 'ceramic-porcelain', 'Ceramic / Porcelain Tile', 'กระเบื้องเซรามิค/พอร์ซเลน', 'Soft stone porcelain in wet zones only', false, 4)
on conflict (style_id, flooring_id) do update set
  label_en = excluded.label_en,
  label_th = excluded.label_th,
  prompt_hint = excluded.prompt_hint,
  is_default = excluded.is_default,
  sort_order = excluded.sort_order;

-- Placeholder asset slots (upload binaries into style-assets bucket; then set storage_path + public_url)
insert into public.style_assets (
  style_id, kind, slot_key, label_en, label_th, prompt_hint, sort_order
) values
  -- facade refs
  ('minimal', 'facade_ref', 'facade-front-01', 'Minimal front elevation mood', 'ด้านหน้ามินิมอล', 'Clean flat facade, large glazing, white/grey render', 1),
  ('minimal', 'facade_ref', 'facade-front-02', 'Minimal side massing mood', 'มวลอาคารมินิมอล', 'Simple box volumes, recessed entry, no ornament', 2),
  ('scandinavian', 'facade_ref', 'facade-front-01', 'Modern Nordic front elevation', 'ด้านหน้าโมเดิร์นนอร์ดิก', 'Light wood cladding accents, white walls, gabled or flat calm roof', 1),
  ('scandinavian', 'facade_ref', 'facade-front-02', 'Scandinavian street facade', 'ด้านหน้าสแกนดิ', 'Soft daylight, pale timber, generous windows', 2),
  ('tropical-minimal', 'facade_ref', 'facade-front-01', 'Tropical front elevation', 'ด้านหน้าโทรปิคัล', 'Deep eaves, timber screens, indoor-outdoor terrace', 1),
  ('tropical-minimal', 'facade_ref', 'facade-front-02', 'Tropical garden facade', 'ด้านหน้าสวนโทรปิคัล', 'Lush planting, breezeway, warm materials', 2),
  ('loft', 'facade_ref', 'facade-front-01', 'Luxury loft front elevation', 'ด้านหน้าลอฟท์หรู', 'Dark metal, concrete, tall openings, refined industrial', 1),
  ('loft', 'facade_ref', 'facade-front-02', 'Luxury facade night mood', 'ด้านหน้าลักซ์ชัวรี', 'High-contrast materials, sculpted lighting', 2),
  ('japanese', 'facade_ref', 'facade-front-01', 'Japanese Zen front elevation', 'ด้านหน้าญี่ปุ่นเซน', 'Horizontal timber, shoji-inspired screens, calm asymmetry', 1),
  ('japanese', 'facade_ref', 'facade-front-02', 'Japanese courtyard facade', 'ด้านหน้าลานญี่ปุ่น', 'Engawa edge, soft shadow, natural wood', 2),
  -- materials
  ('minimal', 'material', 'exterior-render', 'Smooth render / paint', 'ฉาบเรียบ', 'Matte white or light grey exterior render', 10),
  ('scandinavian', 'material', 'timber-cladding', 'Pale timber cladding', 'ไม้บุผนังโทนอ่อน', 'Light ash/birch vertical cladding', 10),
  ('tropical-minimal', 'material', 'timber-screen', 'Timber privacy screen', 'ฉากไม้', 'Warm hardwood brise-soleil / lattice', 10),
  ('loft', 'material', 'dark-metal', 'Dark metal / steel', 'โลหะเข้ม', 'Charcoal steel frames and accents', 10),
  ('japanese', 'material', 'natural-wood', 'Natural wood surfaces', 'ไม้ธรรมชาติ', 'Cedar/cypress tones, soft grain', 10),
  -- textures
  ('minimal', 'texture', 'matte-surfaces', 'Matte surface texture', 'ผิวด้าน', 'Low-sheen plaster and porcelain texture', 20),
  ('scandinavian', 'texture', 'soft-wood-grain', 'Soft wood grain', 'ลายไม้เบา', 'Subtle blonde wood grain', 20),
  ('tropical-minimal', 'texture', 'warm-stone', 'Warm stone texture', 'หินโทนอุ่น', 'Sandstone / warm ceramic texture', 20),
  ('loft', 'texture', 'raw-concrete', 'Raw concrete texture', 'คอนกรีตดิบ', 'Board-formed or polished concrete texture', 20),
  ('japanese', 'texture', 'washi-soft', 'Soft natural texture', 'ผิวธรรมชาติอ่อน', 'Soft plaster and wood with paper-like calm', 20),
  -- mood
  ('minimal', 'mood', 'daylight-calm', 'Calm daylight mood', 'แสงกลางวันสงบ', 'Bright even daylight, sparse furniture, quiet atmosphere', 30),
  ('scandinavian', 'mood', 'airy-nordic', 'Airy Nordic mood', 'บรรยากาศนอร์ดิก', 'Soft north light, cozy textiles, pale interiors', 30),
  ('tropical-minimal', 'mood', 'shaded-breeze', 'Shaded tropical breeze', 'ร่มเงาโทรปิคัล', 'Dappled shade, greenery, warm afternoon light', 30),
  ('loft', 'mood', 'dramatic-luxury', 'Dramatic luxury mood', 'บรรยากาศหรู', 'Contrast lighting, rich materials, evening drama', 30),
  ('japanese', 'mood', 'zen-quiet', 'Zen quiet mood', 'บรรยากาศเซน', 'Soft shadows, empty space, meditative calm', 30)
on conflict (style_id, kind, slot_key) do update set
  label_en = excluded.label_en,
  label_th = excluded.label_th,
  prompt_hint = excluded.prompt_hint,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();
