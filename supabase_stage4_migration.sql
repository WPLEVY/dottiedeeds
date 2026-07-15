-- Dottie Deeds — Stage 4 migration: master version history + matter version stamping
-- Additive and backward-compatible. Applied to the live database on 2026-07-12.
-- The pre-refactor live app ignores the new table and columns; the refactor branch uses them.

-- 1) Immutable snapshot of the firm master (settings + provisions), written on every save.
create table if not exists public.master_versions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  version_no  integer not null,
  snapshot    jsonb   not null,
  note        text,
  created_at  timestamptz not null default now()
);

create index if not exists master_versions_user_created_idx
  on public.master_versions (user_id, created_at desc);

alter table public.master_versions enable row level security;

-- Read your own history.
create policy "master_versions_select_own"
  on public.master_versions for select
  using (auth.uid() = user_id);

-- Append-only. No update or delete policies, so past versions are immutable (the audit trail).
create policy "master_versions_insert_own"
  on public.master_versions for insert
  with check (auth.uid() = user_id);

-- 2) Stamp each saved matter and each metered deed with the master version that produced it.
alter table public.saved_documents add column if not exists master_version integer;
alter table public.deeds           add column if not exists master_version integer;
