-- 集點 App - Supabase 資料庫結構
-- 請在 Supabase 的 SQL Editor 中執行此檔案

-- ── Children ──────────────────────────────────────────────
create table public.children (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default 'orange',
  created_at timestamptz default now()
);

alter table public.children enable row level security;

create policy "家長只能管理自己的小孩" on public.children
  using (parent_id = auth.uid())
  with check (parent_id = auth.uid());

-- ── Point Items ───────────────────────────────────────────
create table public.point_items (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  name text not null,
  points integer not null,
  item_type text not null default 'manual', -- 'daily' 或 'manual'
  created_at timestamptz default now()
);

alter table public.point_items enable row level security;

create policy "家長只能管理自己小孩的項目" on public.point_items
  using (
    child_id in (select id from public.children where parent_id = auth.uid())
  )
  with check (
    child_id in (select id from public.children where parent_id = auth.uid())
  );

-- ── Point Records ─────────────────────────────────────────
create table public.point_records (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  item_id uuid references public.point_items(id) on delete set null,
  item_name text not null,
  points integer not null,
  recorded_at date not null default current_date,
  created_at timestamptz default now()
);

alter table public.point_records enable row level security;

create policy "家長只能管理自己小孩的記錄" on public.point_records
  using (
    child_id in (select id from public.children where parent_id = auth.uid())
  )
  with check (
    child_id in (select id from public.children where parent_id = auth.uid())
  );

-- ── Goals ─────────────────────────────────────────────────
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  child_id uuid references public.children(id) on delete cascade not null,
  name text not null,
  required_points integer not null,
  quantity_limit integer,       -- null 表示無限次
  quantity_used integer not null default 0,
  expires_at date,              -- null 表示無期限
  created_at timestamptz default now()
);

alter table public.goals enable row level security;

create policy "家長只能管理自己小孩的目標" on public.goals
  using (
    child_id in (select id from public.children where parent_id = auth.uid())
  )
  with check (
    child_id in (select id from public.children where parent_id = auth.uid())
  );
