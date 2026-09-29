-- ============================================================================
-- TFC Connect · 0001_init.sql
-- Core schema, Row-Level Security, triggers and the matching engine.
-- Target: Supabase (Postgres 15+). Do not edit after applying; add new migrations.
-- ============================================================================

-- ---------- Enums ----------------------------------------------------------
create type public.founder_role     as enum ('idea', 'join', 'either');
create type public.skill            as enum ('tech', 'product', 'design', 'growth', 'sales', 'ops', 'domain');
create type public.commitment       as enum ('full_time', 'part_time', 'after_grad');
create type public.startup_stage    as enum ('idea', 'building', 'launched', 'revenue', 'funded');
create type public.connection_status as enum ('pending', 'accepted', 'declined', 'expired', 'archived');
create type public.verification_tier as enum ('listed', 'verified', 'tfc_backed');
create type public.role_type        as enum ('cofounder', 'intern', 'freelance');
create type public.review_status    as enum ('pending', 'approved', 'rejected', 'needs_info');
create type public.match_action     as enum ('none', 'connected', 'saved', 'not_fit');

-- ---------- Chapters -------------------------------------------------------
create table public.chapters (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                 -- "TFC NSUT"
  college     text not null,
  city        text,
  code        text not null unique,          -- "TFC-NSUT-01", used for chapter verification
  created_at  timestamptz not null default now()
);

-- ---------- Profiles -------------------------------------------------------
create table public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  full_name             text,
  avatar_url            text,
  headline              text check (char_length(headline) <= 120),
  college               text,
  city                  text,
  bio                   text check (char_length(bio) <= 600),
  why_startup           text check (char_length(why_startup) <= 200),
  role                  public.founder_role,
  primary_skill         public.skill,
  secondary_skills      public.skill[] not null default '{}',
  tags                  text[] not null default '{}',          -- free tags: React, ML, Figma…
  looking_for_skills    public.skill[] not null default '{}',
  industries            text[] not null default '{}',
  commitment            public.commitment,
  available_from        date,
  remote_ok             boolean not null default true,
  equity_pref           text check (equity_pref in ('equal', 'open', 'depends')),
  work_style            jsonb not null default '{}'::jsonb,    -- {speed, risk, hours, decision} each 0-100
  proof_links           jsonb not null default '[]'::jsonb,    -- [{url, title, note}]
  chapter_id            uuid references public.chapters(id),
  open_to_join          boolean not null default false,
  onboarding_complete   boolean not null default false,
  hidden                boolean not null default false,
  hide_from_own_college boolean not null default false,
  -- protected fields (only admins / system can change; see trigger below)
  college_email_verified boolean not null default false,
  chapter_verified      boolean not null default false,
  linkedin_verified     boolean not null default false,
  is_fellow             boolean not null default false,
  is_admin              boolean not null default false,
  last_active_at        timestamptz not null default now(),
  still_looking_at      timestamptz not null default now(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index profiles_active_idx on public.profiles (last_active_at) where onboarding_complete and not hidden;

-- Private contact details: visible only to owner, accepted connections, admins.
create table public.profile_contacts (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  email        text,
  phone        text,
  linkedin_url text
);

-- ---------- Helper functions ------------------------------------------------
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- ---------- Connections & messages -----------------------------------------
create table public.connections (
  id              uuid primary key default gen_random_uuid(),
  from_id         uuid not null references public.profiles(id) on delete cascade,
  to_id           uuid not null references public.profiles(id) on delete cascade,
  note            text not null check (char_length(note) between 50 and 500),
  status          public.connection_status not null default 'pending',
  fitkit_done     smallint[] not null default '{}',   -- Fit Kit question numbers 1-10 marked done
  teamed_up_from  boolean not null default false,
  teamed_up_to    boolean not null default false,
  teamed_up_at    timestamptz,
  created_at      timestamptz not null default now(),
  responded_at    timestamptz,
  last_message_at timestamptz,
  check (from_id <> to_id)
);
-- one live connection per pair, whichever direction
create unique index connections_pair_uidx on public.connections
  (least(from_id, to_id), greatest(from_id, to_id))
  where status in ('pending', 'accepted');
create index connections_to_idx on public.connections (to_id, status);
create index connections_from_idx on public.connections (from_id, status, created_at);

create or replace function public.is_connected(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.connections c
    where c.status = 'accepted'
      and ((c.from_id = a and c.to_id = b) or (c.from_id = b and c.to_id = a))
  );
$$;

create table public.messages (
  id            uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  sender_id     uuid not null references public.profiles(id) on delete cascade,
  body          text not null check (char_length(body) between 1 and 4000),
  kind          text not null default 'text' check (kind in ('text', 'fitkit', 'system')),
  created_at    timestamptz not null default now()
);
create index messages_conn_idx on public.messages (connection_id, created_at);

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create or replace function public.is_blocked(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.blocks
                 where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a));
$$;

create table public.profile_saves (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  target_id  uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, target_id)
);

create table public.profile_passes (          -- "Not a fit" (private)
  user_id    uuid not null references public.profiles(id) on delete cascade,
  target_id  uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, target_id)
);

create table public.matches_daily (
  user_id      uuid not null references public.profiles(id) on delete cascade,
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  for_date     date not null,
  score        smallint not null check (score between 0 and 100),
  reasons      text[] not null default '{}',
  action       public.match_action not null default 'none',
  primary key (user_id, candidate_id, for_date)
);
create index matches_daily_user_date_idx on public.matches_daily (user_id, for_date desc);

-- ---------- Startups -------------------------------------------------------
create table public.startups (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text not null check (char_length(name) <= 60),
  logo_url          text,
  cover_url         text,
  one_liner         text not null check (char_length(one_liner) <= 80),
  problem           text check (char_length(problem) <= 600),
  solution          text check (char_length(solution) <= 600),
  stage             public.startup_stage not null default 'idea',
  industry          text not null,
  city              text,
  website           text,
  demo_video_url    text,
  founded_year      smallint,
  metrics           jsonb not null default '[]'::jsonb,   -- [{label, value}]
  funding_raised    text,
  status_tags       text[] not null default '{}'
                    check (status_tags <@ array['needs_cofounder','hiring','beta_users','raising','mentors']::text[]),
  deck_path         text,                                 -- private storage path (decks bucket)
  verification_tier public.verification_tier not null default 'listed',
  claimed           boolean not null default true,        -- false = pre-filled by TFC, claimable
  is_hidden         boolean not null default false,
  created_by        uuid references public.profiles(id) on delete set null,
  last_update_at    timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index startups_browse_idx on public.startups (verification_tier, stage, industry) where not is_hidden;
create index startups_search_idx on public.startups using gin (to_tsvector('simple', name || ' ' || one_liner || ' ' || coalesce(industry, '')));

create table public.startup_members (
  startup_id uuid not null references public.startups(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role_title text,
  is_owner   boolean not null default false,
  met_on_tfc boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (startup_id, user_id)
);

create or replace function public.is_startup_member(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.startup_members where startup_id = sid and user_id = auth.uid());
$$;

create or replace function public.is_startup_owner(sid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.startup_members where startup_id = sid and user_id = auth.uid() and is_owner);
$$;

create table public.open_roles (
  id          uuid primary key default gen_random_uuid(),
  startup_id  uuid not null references public.startups(id) on delete cascade,
  title       text not null,
  type        public.role_type not null,
  skills      public.skill[] not null default '{}',
  commitment  public.commitment,
  description text check (char_length(description) <= 1000),
  is_open     boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.role_applications (
  id           uuid primary key default gen_random_uuid(),
  role_id      uuid not null references public.open_roles(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  note         text not null check (char_length(note) between 50 and 500),
  status       public.connection_status not null default 'pending',
  created_at   timestamptz not null default now(),
  unique (role_id, applicant_id)
);

create table public.startup_updates (
  id         uuid primary key default gen_random_uuid(),
  startup_id uuid not null references public.startups(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index startup_updates_idx on public.startup_updates (startup_id, created_at desc);

create table public.follows (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  startup_id uuid not null references public.startups(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, startup_id)
);

create table public.upvotes (
  user_id    uuid not null references public.profiles(id) on delete cascade,
  startup_id uuid not null references public.startups(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, startup_id)
);

create table public.collections (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  description  text,
  theme        text not null default 'orange' check (theme in ('orange', 'forest', 'amber', 'ink', 'ballpoint')),
  is_published boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

create table public.collection_items (
  collection_id uuid not null references public.collections(id) on delete cascade,
  startup_id    uuid not null references public.startups(id) on delete cascade,
  position      int not null default 0,
  primary key (collection_id, startup_id)
);

-- ---------- Trust & safety / admin -----------------------------------------
create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('profile', 'startup', 'message', 'connection')),
  target_id   uuid not null,
  reason      text not null check (reason in ('spam', 'fake', 'harassment', 'inappropriate', 'other')),
  details     text check (char_length(details) <= 1000),
  status      public.review_status not null default 'pending',
  resolved_by uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

create table public.verification_requests (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('profile', 'startup')),
  target_id    uuid not null,
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  evidence     text,                      -- chapter code, product link, etc.
  status       public.review_status not null default 'pending',
  reviewer_note text,
  reviewed_by  uuid references public.profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------- Public team view (startup pages are public; profiles are not) ---
create view public.startup_team_public as
  select m.startup_id, m.user_id, p.full_name, p.avatar_url, p.college, m.role_title, m.is_owner, m.met_on_tfc
  from public.startup_members m
  join public.profiles p on p.id = m.user_id;

-- ============================================================================
-- Triggers
-- ============================================================================

-- New auth user -> profile + contacts row
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id,
          coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
          new.raw_user_meta_data ->> 'avatar_url');
  insert into public.profile_contacts (user_id, email) values (new.id, new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Users cannot grant themselves verification/admin
create or replace function public.protect_profile_fields() returns trigger
language plpgsql set search_path = public as $$
begin
  if not public.is_admin() and auth.uid() is not null then
    new.college_email_verified := old.college_email_verified;
    new.chapter_verified       := old.chapter_verified;
    new.linkedin_verified      := old.linkedin_verified;
    new.is_fellow              := old.is_fellow;
    new.is_admin               := old.is_admin;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger profiles_protect before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- Users cannot self-promote a startup's verification tier
create or replace function public.protect_startup_fields() returns trigger
language plpgsql set search_path = public as $$
begin
  if not public.is_admin() and auth.uid() is not null then
    new.verification_tier := old.verification_tier;
    new.claimed           := old.claimed;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger startups_protect before update on public.startups
  for each row execute function public.protect_startup_fields();

-- New listings always start as 'listed' unless an admin creates them
create or replace function public.startup_defaults() returns trigger
language plpgsql set search_path = public as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.verification_tier := 'listed';
    new.claimed := true;
    new.created_by := auth.uid();
  end if;
  return new;
end $$;
create trigger startups_defaults before insert on public.startups
  for each row execute function public.startup_defaults();

-- Creator becomes owner-member
create or replace function public.startup_add_owner() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.created_by is not null then
    insert into public.startup_members (startup_id, user_id, is_owner, role_title)
    values (new.id, new.created_by, true, 'Founder')
    on conflict do nothing;
  end if;
  return new;
end $$;
create trigger startups_add_owner after insert on public.startups
  for each row execute function public.startup_add_owner();

-- Connection request rules: 10 per rolling week, not blocked, recipient visible
create or replace function public.check_connection_request() returns trigger
language plpgsql security definer set search_path = public as $$
declare sent_this_week int;
begin
  if public.is_blocked(new.from_id, new.to_id) then
    raise exception 'You can''t connect with this person.' using errcode = 'P0001';
  end if;
  select count(*) into sent_this_week from public.connections
   where from_id = new.from_id and created_at > now() - interval '7 days';
  if sent_this_week >= 10 then
    raise exception 'You''ve used your 10 requests for this week. They reset on a rolling 7-day basis.' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.connections
             where from_id = new.from_id and to_id = new.to_id
               and status = 'declined' and responded_at > now() - interval '90 days') then
    raise exception 'This person isn''t available to connect right now.' using errcode = 'P0001';
  end if;
  new.status := 'pending';
  new.teamed_up_from := false;
  new.teamed_up_to := false;
  return new;
end $$;
create trigger connections_check before insert on public.connections
  for each row execute function public.check_connection_request();

-- Guard connection updates: only recipient accepts/declines; teamed_up flags per side
create or replace function public.guard_connection_update() returns trigger
language plpgsql set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then return new; end if;
  -- immutable fields
  new.from_id := old.from_id; new.to_id := old.to_id; new.note := old.note; new.created_at := old.created_at;
  if new.status is distinct from old.status then
    if old.status = 'pending' and new.status in ('accepted', 'declined') and auth.uid() = old.to_id then
      new.responded_at := now();
    elsif old.status = 'accepted' and new.status = 'archived' then
      null;
    elsif old.status = 'pending' and new.status = 'archived' and auth.uid() = old.from_id then
      null; -- sender withdraws
    else
      raise exception 'Not allowed.' using errcode = 'P0001';
    end if;
  end if;
  if auth.uid() = old.from_id then new.teamed_up_to := old.teamed_up_to; end if;
  if auth.uid() = old.to_id   then new.teamed_up_from := old.teamed_up_from; end if;
  if new.status <> 'accepted' then
    new.teamed_up_from := old.teamed_up_from; new.teamed_up_to := old.teamed_up_to;
  end if;
  if new.teamed_up_from and new.teamed_up_to and old.teamed_up_at is null then
    new.teamed_up_at := now();
  end if;
  return new;
end $$;
create trigger connections_guard before update on public.connections
  for each row execute function public.guard_connection_update();

-- Messages bump connection + sender activity
create or replace function public.on_message_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.connections set last_message_at = new.created_at where id = new.connection_id;
  update public.profiles set last_active_at = now() where id = new.sender_id;
  return new;
end $$;
create trigger messages_after_insert after insert on public.messages
  for each row execute function public.on_message_insert();

-- Max 3 updates per startup per rolling week; bump last_update_at
create or replace function public.check_startup_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.startup_updates
      where startup_id = new.startup_id and created_at > now() - interval '7 days') >= 3 then
    raise exception 'Max 3 updates per week. Make the next one count.' using errcode = 'P0001';
  end if;
  update public.startups set last_update_at = now() where id = new.startup_id;
  return new;
end $$;
create trigger startup_updates_check before insert on public.startup_updates
  for each row execute function public.check_startup_update();

-- ============================================================================
-- Row-Level Security
-- ============================================================================
alter table public.chapters              enable row level security;
alter table public.profiles              enable row level security;
alter table public.profile_contacts      enable row level security;
alter table public.connections           enable row level security;
alter table public.messages              enable row level security;
alter table public.blocks                enable row level security;
alter table public.profile_saves         enable row level security;
alter table public.profile_passes        enable row level security;
alter table public.matches_daily         enable row level security;
alter table public.startups              enable row level security;
alter table public.startup_members       enable row level security;
alter table public.open_roles            enable row level security;
alter table public.role_applications     enable row level security;
alter table public.startup_updates       enable row level security;
alter table public.follows               enable row level security;
alter table public.upvotes               enable row level security;
alter table public.collections           enable row level security;
alter table public.collection_items      enable row level security;
alter table public.reports               enable row level security;
alter table public.verification_requests enable row level security;

-- chapters: public read, admin write
create policy chapters_read  on public.chapters for select using (true);
create policy chapters_admin on public.chapters for all using (public.is_admin()) with check (public.is_admin());

-- profiles: signed-in users see completed, visible, non-blocked profiles; always self
create policy profiles_read on public.profiles for select to authenticated using (
  id = auth.uid() or public.is_admin()
  or (onboarding_complete and not hidden and not public.is_blocked(auth.uid(), id))
);
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- contacts: owner, accepted connections, admins
create policy contacts_read on public.profile_contacts for select to authenticated using (
  user_id = auth.uid() or public.is_admin() or public.is_connected(auth.uid(), user_id)
);
create policy contacts_update on public.profile_contacts for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- connections: parties only
create policy connections_read on public.connections for select to authenticated
  using (auth.uid() in (from_id, to_id) or public.is_admin());
create policy connections_insert on public.connections for insert to authenticated
  with check (from_id = auth.uid());
create policy connections_update on public.connections for update to authenticated
  using (auth.uid() in (from_id, to_id) or public.is_admin());

-- messages: parties of an accepted connection
create policy messages_read on public.messages for select to authenticated using (
  public.is_admin() or exists (select 1 from public.connections c
    where c.id = connection_id and auth.uid() in (c.from_id, c.to_id))
);
create policy messages_insert on public.messages for insert to authenticated with check (
  sender_id = auth.uid() and exists (select 1 from public.connections c
    where c.id = connection_id and c.status = 'accepted' and auth.uid() in (c.from_id, c.to_id))
);

-- blocks / saves / passes / matches: own rows only
create policy blocks_own  on public.blocks         for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());
create policy saves_own   on public.profile_saves  for all to authenticated using (user_id = auth.uid())    with check (user_id = auth.uid());
create policy passes_own  on public.profile_passes for all to authenticated using (user_id = auth.uid())    with check (user_id = auth.uid());
create policy matches_read   on public.matches_daily for select to authenticated using (user_id = auth.uid());
create policy matches_action on public.matches_daily for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- startups: public read of visible; members edit; any signed-in user can create
create policy startups_read on public.startups for select using (
  not is_hidden or public.is_startup_member(id) or public.is_admin()
);
create policy startups_insert on public.startups for insert to authenticated with check (true);
create policy startups_update on public.startups for update to authenticated
  using (public.is_startup_member(id) or public.is_admin());
create policy startups_delete on public.startups for delete to authenticated
  using (public.is_admin() or public.is_startup_owner(id));

create policy members_read  on public.startup_members for select using (true);
create policy members_write on public.startup_members for all to authenticated
  using (public.is_admin() or public.is_startup_owner(startup_id))
  with check (public.is_admin() or public.is_startup_owner(startup_id));

create policy roles_read  on public.open_roles for select using (true);
create policy roles_write on public.open_roles for all to authenticated
  using (public.is_startup_member(startup_id) or public.is_admin())
  with check (public.is_startup_member(startup_id) or public.is_admin());

create policy apps_read on public.role_applications for select to authenticated using (
  applicant_id = auth.uid() or public.is_admin()
  or exists (select 1 from public.open_roles r where r.id = role_id and public.is_startup_member(r.startup_id))
);
create policy apps_insert on public.role_applications for insert to authenticated with check (applicant_id = auth.uid());
create policy apps_update on public.role_applications for update to authenticated using (
  public.is_admin() or exists (select 1 from public.open_roles r where r.id = role_id and public.is_startup_member(r.startup_id))
);

create policy updates_read  on public.startup_updates for select using (true);
create policy updates_write on public.startup_updates for insert to authenticated
  with check (author_id = auth.uid() and public.is_startup_member(startup_id));
create policy updates_delete on public.startup_updates for delete to authenticated
  using (author_id = auth.uid() or public.is_admin());

create policy follows_read on public.follows for select using (true);
create policy follows_own  on public.follows for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy upvotes_read on public.upvotes for select using (true);
create policy upvotes_own  on public.upvotes for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy collections_read  on public.collections for select using (is_published or public.is_admin());
create policy collections_admin on public.collections for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy citems_read  on public.collection_items for select using (true);
create policy citems_admin on public.collection_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy reports_insert on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy reports_admin  on public.reports for select to authenticated using (public.is_admin() or reporter_id = auth.uid());
create policy reports_update on public.reports for update to authenticated using (public.is_admin());

create policy vreq_insert on public.verification_requests for insert to authenticated with check (submitted_by = auth.uid());
create policy vreq_read   on public.verification_requests for select to authenticated using (submitted_by = auth.uid() or public.is_admin());
create policy vreq_update on public.verification_requests for update to authenticated using (public.is_admin());

grant select on public.startup_team_public to anon, authenticated;

-- ============================================================================
-- Matching engine
-- Weights (keep in sync with src/lib/matching/weights.ts):
--   skills 35 · commitment 20 · industry 15 · location 10 · work style 10 · quality 10
-- ============================================================================
create or replace function public.skill_label(s public.skill) returns text
language sql immutable as $$
  select case s when 'tech' then 'Tech' when 'product' then 'Product' when 'design' then 'Design'
                when 'growth' then 'Growth' when 'sales' then 'Sales/BD' when 'ops' then 'Ops/Finance'
                else 'Domain expertise' end;
$$;

create or replace function public.match_score(a public.profiles, b public.profiles,
  out score int, out reasons text[])
language plpgsql stable as $$
declare
  b_has public.skill[] := array_append(b.secondary_skills, b.primary_skill);
  a_has public.skill[] := array_append(a.secondary_skills, a.primary_skill);
  a_need_met int; b_need_met int; fa numeric; fb numeric;
  s_skill numeric; s_commit numeric; s_ind numeric; s_loc numeric; s_style numeric; s_qual numeric;
  shared_ind text[]; inter int; uni int; diff numeric; n int; k text; proofs int;
begin
  reasons := '{}';

  -- 1. complementary skills (35): they have what you need AND you have what they need
  select count(*) into a_need_met from unnest(a.looking_for_skills) x where x = any(b_has);
  select count(*) into b_need_met from unnest(b.looking_for_skills) x where x = any(a_has);
  fa := case when cardinality(a.looking_for_skills) = 0 then 0.5 else least(a_need_met::numeric / cardinality(a.looking_for_skills), 1) end;
  fb := case when cardinality(b.looking_for_skills) = 0 then 0.5 else least(b_need_met::numeric / cardinality(b.looking_for_skills), 1) end;
  s_skill := 35 * (fa + fb) / 2;
  if a_need_met > 0 then
    reasons := reasons || format('You need %s, and they bring it', public.skill_label(
      (select x from unnest(a.looking_for_skills) x where x = any(b_has) limit 1)));
  end if;
  if b_need_met > 0 then
    reasons := reasons || format('They need %s, which is your strength', public.skill_label(
      (select x from unnest(b.looking_for_skills) x where x = any(a_has) limit 1)));
  end if;

  -- 2. commitment & timing (20)
  s_commit := case
    when a.commitment is null or b.commitment is null then 8
    when a.commitment = b.commitment then 20
    when 'part_time' in (a.commitment, b.commitment) then 10
    else 0 end;
  if a.commitment = b.commitment and a.commitment = 'full_time' then reasons := reasons || 'You''re both going full-time'::text;
  elsif a.commitment = b.commitment and a.commitment = 'part_time' then reasons := reasons || 'You''re both building part-time'::text;
  end if;

  -- 3. industry overlap (15): Jaccard
  select array_agg(x) into shared_ind from unnest(a.industries) x where x = any(b.industries);
  inter := coalesce(cardinality(shared_ind), 0);
  select count(distinct x) into uni from unnest(a.industries || b.industries) x;
  s_ind := case when uni = 0 then 7 else 15 * inter::numeric / uni end;
  if inter > 0 then reasons := reasons || format('Both into %s', array_to_string(shared_ind[1:2], ' & ')); end if;

  -- 4. location / remote fit (10)
  s_loc := case
    when a.city is not null and lower(a.city) = lower(b.city) then 10
    when a.remote_ok and b.remote_ok then 7
    when a.remote_ok or b.remote_ok then 4
    else 0 end;
  if a.city is not null and lower(a.city) = lower(b.city) then reasons := reasons || format('Both in %s', a.city); end if;

  -- 5. working-style similarity (10): 1 - mean abs diff over shared keys (0-100 sliders)
  diff := 0; n := 0;
  foreach k in array array['speed', 'risk', 'hours', 'decision'] loop
    if a.work_style ? k and b.work_style ? k then
      diff := diff + abs((a.work_style ->> k)::numeric - (b.work_style ->> k)::numeric);
      n := n + 1;
    end if;
  end loop;
  s_style := case when n = 0 then 5 else 10 * greatest(0, 1 - (diff / n) / 100) end;
  if n > 0 and (diff / n) <= 15 then reasons := reasons || 'Similar working style'::text; end if;

  -- 6. profile quality & verification (10)
  proofs := jsonb_array_length(b.proof_links);
  s_qual := least(10,
      (case when b.college_email_verified or b.chapter_verified then 4 else 0 end)
    + (case when b.linkedin_verified then 1 else 0 end)
    + least(proofs, 3)
    + (case when coalesce(char_length(b.bio), 0) >= 80 then 1 else 0 end)
    + (case when b.is_fellow then 1 else 0 end));

  score := round(s_skill + s_commit + s_ind + s_loc + s_style + s_qual)::int;
  reasons := reasons[1:3];
end $$;

-- Hard filters: returns true if b may be shown to a
create or replace function public.match_eligible(a public.profiles, b public.profiles) returns boolean
language sql stable security definer set search_path = public as $$
  select a.id <> b.id
    and b.onboarding_complete and not b.hidden
    and b.last_active_at > now() - interval '30 days'
    and b.still_looking_at > now() - interval '45 days'
    -- two idea-holders who won't join anything
    and not (a.role = 'idea' and b.role = 'idea')
    -- full-time now vs after graduation
    and not ('full_time' = any(array[a.commitment, b.commitment]) and 'after_grad' = any(array[a.commitment, b.commitment]))
    -- privacy: hide from own college
    and not (b.hide_from_own_college and a.college is not null and lower(a.college) = lower(b.college))
    and not public.is_blocked(a.id, b.id)
    and not exists (select 1 from public.connections c
      where ((c.from_id = a.id and c.to_id = b.id) or (c.from_id = b.id and c.to_id = a.id))
        and (c.status in ('pending', 'accepted')
             or (c.status = 'declined' and c.responded_at > now() - interval '90 days')))
    and not exists (select 1 from public.profile_passes p
      where p.user_id = a.id and p.target_id = b.id and p.created_at > now() - interval '90 days');
$$;

-- Nightly job: 5 fresh matches per active user (not shown in the last 7 days)
create or replace function public.compute_daily_matches(per_user int default 5) returns int
language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'Asia/Kolkata')::date;
  u public.profiles;
  inserted int := 0;
  c int;
begin
  for u in select * from public.profiles
           where onboarding_complete and not hidden and last_active_at > now() - interval '30 days'
  loop
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
    inserted := inserted + c;
  end loop;
  return inserted;
end $$;

-- Expire unanswered requests after 14 days (run daily)
create or replace function public.expire_old_requests() returns int
language sql security definer set search_path = public as $$
  with x as (
    update public.connections set status = 'expired', responded_at = now()
    where status = 'pending' and created_at < now() - interval '14 days'
    returning 1)
  select count(*)::int from x;
$$;

revoke execute on function public.compute_daily_matches(int) from public, anon, authenticated;
revoke execute on function public.expire_old_requests() from public, anon, authenticated;
