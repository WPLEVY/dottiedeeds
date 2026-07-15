-- Dottie Deeds — Stage 7 migration: per-firm sharing
-- Introduces firms as the sharing unit. Firm settings/provisions (the master),
-- saved matters, and version history become shared across a firm's members.
-- Isolation is enforced by row-level security keyed to the caller's firm.
-- Additive + backfilled: existing users each get their own firm automatically.

-- 1) Firms hold the shared master (firm settings + provisions).
create table if not exists public.firms (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  invite_code text unique not null,
  master      jsonb not null default '{}'::jsonb,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
alter table public.firms enable row level security;

-- 2) Link users and their data to a firm.
alter table public.profiles        add column if not exists firm_id uuid references public.firms(id) on delete set null;
alter table public.saved_documents add column if not exists firm_id uuid references public.firms(id) on delete cascade;
alter table public.master_versions add column if not exists firm_id uuid references public.firms(id) on delete cascade;

-- 3) The caller's firm (SECURITY DEFINER so RLS can call it safely).
create or replace function public.current_firm_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select firm_id from public.profiles where id = auth.uid();
$$;
grant execute on function public.current_firm_id() to authenticated;

-- 4) Create a firm (generates a unique invite code) and join it.
create or replace function public.create_firm(p_name text, p_master jsonb default '{}'::jsonb)
  returns jsonb language plpgsql security definer set search_path = public as $$
declare fid uuid; code text;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  loop
    code := upper(substr(md5(random()::text||clock_timestamp()::text),1,6));
    exit when not exists (select 1 from public.firms where invite_code = code);
  end loop;
  insert into public.firms(name, invite_code, master, created_by)
    values (p_name, code, coalesce(p_master,'{}'::jsonb), auth.uid()) returning id into fid;
  update public.profiles set firm_id = fid where id = auth.uid();
  return jsonb_build_object('firm_id', fid, 'invite_code', code);
end $$;
grant execute on function public.create_firm(text, jsonb) to authenticated;

-- 5) Join an existing firm by its invite code.
create or replace function public.join_firm_by_code(p_code text)
  returns jsonb language plpgsql security definer set search_path = public as $$
declare fid uuid; fmaster jsonb; fname text; fcode text;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select id, master, name, invite_code into fid, fmaster, fname, fcode
    from public.firms where invite_code = upper(trim(p_code));
  if fid is null then raise exception 'Invalid invite code'; end if;
  update public.profiles set firm_id = fid where id = auth.uid();
  return jsonb_build_object('firm_id', fid, 'invite_code', fcode, 'name', fname, 'master', fmaster);
end $$;
grant execute on function public.join_firm_by_code(text) to authenticated;

-- 6) Row-level security: members can only ever touch their own firm's rows.
create policy firms_select on public.firms for select using (id = public.current_firm_id());
create policy firms_update on public.firms for update using (id = public.current_firm_id()) with check (id = public.current_firm_id());

create policy sd_firm_select on public.saved_documents for select using (firm_id = public.current_firm_id());
create policy sd_firm_insert on public.saved_documents for insert with check (firm_id = public.current_firm_id());
create policy sd_firm_update on public.saved_documents for update using (firm_id = public.current_firm_id());
create policy sd_firm_delete on public.saved_documents for delete using (firm_id = public.current_firm_id());

create policy mv_firm_select on public.master_versions for select using (firm_id = public.current_firm_id());
create policy mv_firm_insert on public.master_versions for insert with check (firm_id = public.current_firm_id());

-- 7) Account deletion, firm-aware: removes the user; keeps firm data if teammates
--    remain; deletes the firm and its shared data only when the last member leaves.
create or replace function public.delete_my_account() returns void
  language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); fid uuid; remaining int;
begin
  if uid is null then raise exception 'Not authenticated'; end if;
  select firm_id into fid from public.profiles where id = uid;
  delete from public.deeds    where user_id = uid;
  delete from public.profiles where id = uid;
  if fid is not null then
    select count(*) into remaining from public.profiles where firm_id = fid;
    if remaining = 0 then
      delete from public.saved_documents where firm_id = fid;
      delete from public.master_versions where firm_id = fid;
      delete from public.firms where id = fid;
    end if;
  end if;
  delete from auth.users where id = uid;
end $$;

-- 8) Backfill: every existing user without a firm gets their own firm from their
--    current master, and their existing matters/versions are attached to it.
do $$
declare r record; fid uuid; code text;
begin
  for r in select id, master, firm from public.profiles where firm_id is null loop
    loop
      code := upper(substr(md5(random()::text||clock_timestamp()::text||r.id::text),1,6));
      exit when not exists (select 1 from public.firms where invite_code = code);
    end loop;
    insert into public.firms(name, invite_code, master, created_by)
      values (coalesce(nullif(r.firm,''), r.master->>'firmName', 'My Firm'), code, coalesce(r.master,'{}'::jsonb), r.id)
      returning id into fid;
    update public.profiles        set firm_id = fid where id = r.id;
    update public.saved_documents set firm_id = fid where user_id = r.id and firm_id is null;
    update public.master_versions set firm_id = fid where user_id = r.id and firm_id is null;
  end loop;
end $$;
