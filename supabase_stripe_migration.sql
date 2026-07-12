-- Dottie Deeds — Stripe + single-session migration
-- Run once in Supabase Studio -> SQL Editor. Safe to re-run (IF NOT EXISTS).

alter table public.profiles add column if not exists stripe_customer_id     text;
alter table public.profiles add column if not exists stripe_subscription_id  text;
alter table public.profiles add column if not exists stripe_metered_item_id  text;
alter table public.profiles add column if not exists plan                    text;   -- 'solo' | 'firm' | null
alter table public.profiles add column if not exists subscription_status     text;   -- 'active','trialing','past_due','canceled',...
alter table public.profiles add column if not exists current_period_end      timestamptz;
alter table public.profiles add column if not exists active_session          uuid;   -- single-active-session token

create index if not exists profiles_stripe_customer_idx on public.profiles (stripe_customer_id);

-- The Stripe worker uses the SERVICE ROLE key, which bypasses RLS, so it can
-- always write these columns. No policy change needed for the worker.
--
-- The app (anon/user token) already updates the user's own profile row
-- (last_seen, master, firm, active_session). Existing "update own profile"
-- RLS continues to allow that. Subscription columns are written ONLY by the
-- worker; the app never writes them.
--
-- OPTIONAL hardening (recommended before real billing): block clients from
-- editing billing columns even on their own row. Uncomment to enforce.
--
-- create or replace function public.guard_billing_columns()
-- returns trigger language plpgsql as $$
-- begin
--   if auth.role() <> 'service_role' then
--     new.stripe_customer_id     := old.stripe_customer_id;
--     new.stripe_subscription_id := old.stripe_subscription_id;
--     new.stripe_metered_item_id := old.stripe_metered_item_id;
--     new.plan                   := old.plan;
--     new.subscription_status    := old.subscription_status;
--     new.current_period_end     := old.current_period_end;
--     new.is_approved            := old.is_approved;  -- keep approval worker/admin-only too
--   end if;
--   return new;
-- end $$;
-- drop trigger if exists guard_billing on public.profiles;
-- create trigger guard_billing before update on public.profiles
--   for each row execute function public.guard_billing_columns();

-- Deed usage this period is derived by counting rows in public.deeds
-- (created_at >= current_period start). No schema change needed there.
