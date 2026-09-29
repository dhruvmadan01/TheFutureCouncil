-- ============================================================================
-- TFC Connect · 0003_compute_user_matches.sql
-- On-demand matching calculation for a single user upon completing onboarding.
-- ============================================================================

create or replace function public.compute_user_matches(target_user uuid, per_user int default 5)
returns int
language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'Asia/Kolkata')::date;
  u public.profiles;
  c int := 0;
begin
  select * into u from public.profiles where id = target_user;
  if not found or not u.onboarding_complete then
    return 0;
  end if;

  insert into public.matches_daily (user_id, candidate_id, for_date, score, reasons)
  select u.id, s.id, today, s.score, s.reasons
  from (
    select b.id, (public.match_score(u, b)).*
    from public.profiles b
    where public.match_eligible(u, b)
      and not exists (select 1 from public.matches_daily m
                      where m.user_id = u.id and m.candidate_id = b.id and m.for_date > today - 7)
  ) s
  order by s.score desc
  limit per_user
  on conflict do nothing;
  
  get diagnostics c = row_count;
  return c;
end $$;

-- Only service role and postgres can execute
revoke execute on function public.compute_user_matches(uuid, int) from public, anon, authenticated;
grant execute on function public.compute_user_matches(uuid, int) to service_role;
