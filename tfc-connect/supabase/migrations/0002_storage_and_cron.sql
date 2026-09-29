-- ============================================================================
-- TFC Connect · 0002_storage_and_cron.sql
-- Supabase-specific: storage buckets and scheduled jobs.
-- Before running this, enable pg_cron under Database → Extensions in the Supabase dashboard.
-- ============================================================================

-- ---------- Storage buckets ------------------------------------------------
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('startup-media', 'startup-media', true),
  ('decks', 'decks', false)
on conflict (id) do nothing;

-- avatars/<user_id>/<file>
create policy "avatars read"   on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars write"  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars delete" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- startup-media/<startup_id>/<file>, writable by startup members
create policy "startup media read"  on storage.objects for select using (bucket_id = 'startup-media');
create policy "startup media write" on storage.objects for insert to authenticated
  with check (bucket_id = 'startup-media' and public.is_startup_member(((storage.foldername(name))[1])::uuid));
create policy "startup media delete" on storage.objects for delete to authenticated
  using (bucket_id = 'startup-media' and public.is_startup_member(((storage.foldername(name))[1])::uuid));

-- decks/<startup_id>/<file>, private: members and admins only
create policy "decks read"  on storage.objects for select to authenticated
  using (bucket_id = 'decks' and (public.is_admin() or public.is_startup_member(((storage.foldername(name))[1])::uuid)));
create policy "decks write" on storage.objects for insert to authenticated
  with check (bucket_id = 'decks' and public.is_startup_member(((storage.foldername(name))[1])::uuid));

-- ---------- Scheduled jobs (pg_cron, times in UTC) --------------------------
-- 02:30 UTC = 08:00 IST: fresh daily matches
select cron.schedule('tfc-daily-matches', '30 2 * * *', $$ select public.compute_daily_matches(); $$);
-- 02:00 UTC: expire requests unanswered for 14 days
select cron.schedule('tfc-expire-requests', '0 2 * * *', $$ select public.expire_old_requests(); $$);
