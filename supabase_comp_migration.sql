-- Dottie Deeds — 60-day free access for beta users
-- Splits "may enter" (is_approved) from "gets it free" (comp_until), which were
-- conflated. Approved users bypassed billing entirely, so turning ENFORCE_SUBSCRIPTION
-- on would not have charged anyone. comp_until is a date, so free access expires.

alter table public.profiles add column if not exists comp_until timestamptz;

comment on column public.profiles.comp_until is
  'Free access through this timestamp. Null means none: the user must subscribe when enforcement is on. Set on approval for beta users.';

-- Existing approved users are the beta cohort: give them 60 days from now.
update public.profiles
   set comp_until = now() + interval '60 days'
 where is_approved = true
   and comp_until is null;
