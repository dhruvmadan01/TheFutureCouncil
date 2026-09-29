-- ============================================================================
-- 0006_startups_trending.sql
-- Trending score view, inactivity flag, and storage upload policy refinement
-- ============================================================================

-- 1. Create startups_trending view
create or replace view public.startups_trending as
with activity as (
  select
    s.id as startup_id,
    count(distinct f.user_id) filter (where f.created_at >= now() - interval '7 days') as follows_7d,
    count(distinct u.user_id) filter (where u.created_at >= now() - interval '7 days') as upvotes_7d,
    count(distinct ra.id) filter (where ra.created_at >= now() - interval '7 days') as applications_7d,
    count(distinct f_all.user_id) as total_follows,
    count(distinct u_all.user_id) as total_upvotes
  from public.startups s
  left join public.follows f on f.startup_id = s.id and f.created_at >= now() - interval '7 days'
  left join public.upvotes u on u.startup_id = s.id and u.created_at >= now() - interval '7 days'
  left join public.open_roles r on r.startup_id = s.id
  left join public.role_applications ra on ra.role_id = r.id and ra.created_at >= now() - interval '7 days'
  left join public.follows f_all on f_all.startup_id = s.id
  left join public.upvotes u_all on u_all.startup_id = s.id
  group by s.id
)
select
  s.*,
  a.total_follows as follows_count,
  a.total_upvotes as upvotes_count,
  (s.last_update_at < now() - interval '90 days') as is_inactive,
  (
    (
      (a.follows_7d + a.upvotes_7d + a.applications_7d) *
      case s.verification_tier
        when 'tfc_backed' then 1.6
        when 'verified' then 1.3
        else 1.0
      end
    ) / (
      case
        when s.last_update_at < now() - interval '90 days' then 5.0
        else 1.0 + (greatest(0, extract(epoch from (now() - s.last_update_at)) / 86400.0) * 0.1)
      end
    )
  )::numeric(10, 2) as trending_score
from public.startups s
join activity a on a.startup_id = s.id;

grant select on public.startups_trending to anon, authenticated;

-- 2. Allow authenticated users to upload to startup-media during creation
create policy "startup media creator write" on storage.objects for insert to authenticated
  with check (bucket_id = 'startup-media');

create policy "startup media creator update" on storage.objects for update to authenticated
  using (bucket_id = 'startup-media');

create policy "startup media creator delete" on storage.objects for delete to authenticated
  using (bucket_id = 'startup-media');
