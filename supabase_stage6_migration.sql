-- Dottie Deeds — Stage 6 migration: self-service account + data deletion
-- Lets a signed-in user permanently delete their own account and every row of their
-- data. SECURITY DEFINER so it can remove the auth.users row; auth.uid() ensures a
-- user can only ever delete their own account. Run once in the Supabase SQL editor.

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;
  delete from public.saved_documents where user_id = uid;
  delete from public.deeds           where user_id = uid;
  delete from public.master_versions where user_id = uid;
  delete from public.profiles        where id = uid;
  delete from auth.users             where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
