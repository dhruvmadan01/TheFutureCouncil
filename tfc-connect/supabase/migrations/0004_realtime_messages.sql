-- ============================================================================
-- TFC Connect · 0004_realtime_messages.sql
-- Enable Supabase Realtime replication on messages and connections
-- ============================================================================

alter table public.messages replica identity full;
alter table public.connections replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
      alter publication supabase_realtime add table public.messages;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'connections') then
      alter publication supabase_realtime add table public.connections;
    end if;
  end if;
end $$;
