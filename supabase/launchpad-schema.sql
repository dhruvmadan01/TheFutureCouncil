-- Launchpad: self-paced 8-week path (start any day), pods formed by join month, pod wall, rankings and a monthly Demo Day.
-- Run once in the Supabase SQL editor for the project used by the site.
--
-- Security model: every table has row level security switched on with NO policies,
-- so the public anon key cannot read or write any of it. All access goes through the
-- serverless function at /api/lp, which uses the service role key and verifies the
-- caller's Google sign-in before touching a row.

create table if not exists lp_batches (
  id          bigint generated always as identity primary key,
  name        text not null,
  starts_on   date not null unique,
  created_at  timestamptz not null default now()
);

create table if not exists lp_pods (
  id          bigint generated always as identity primary key,
  batch_id    bigint not null references lp_batches(id) on delete cascade,
  name        text not null,
  lead_email  text,
  created_at  timestamptz not null default now()
);

create table if not exists lp_enrollments (
  id           bigint generated always as identity primary key,
  email        text not null unique,
  name         text not null,
  college      text,
  batch_id     bigint not null references lp_batches(id),
  pod_id       bigint references lp_pods(id) on delete set null,
  show_public  boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists lp_submissions (
  id             bigint generated always as identity primary key,
  enrollment_id  bigint not null references lp_enrollments(id) on delete cascade,
  milestone      int not null check (milestone between 1 and 8),
  answers        jsonb not null,
  status         text not null default 'pending' check (status in ('pending', 'passed', 'needs_work')),
  checklist      jsonb,
  feedback       text,
  scored_by      text,
  created_at     timestamptz not null default now(),
  scored_at      timestamptz
);
create index if not exists lp_submissions_lookup on lp_submissions (enrollment_id, milestone, created_at desc);
create index if not exists lp_submissions_status on lp_submissions (status);

create table if not exists lp_demo_days (
  id          bigint generated always as identity primary key,
  held_on     date not null,
  title       text,
  stream_url  text,
  status      text not null default 'upcoming' check (status in ('upcoming', 'done')),
  created_at  timestamptz not null default now()
);

create table if not exists lp_rankings (
  id               bigint generated always as identity primary key,
  demo_day_id      bigint not null references lp_demo_days(id) on delete cascade,
  enrollment_id    bigint not null references lp_enrollments(id) on delete cascade,
  scores           jsonb,
  total            numeric,
  notes            text,
  interview_notes  text,
  created_at       timestamptz not null default now(),
  unique (demo_day_id, enrollment_id)
);

create table if not exists lp_finalists (
  id             bigint generated always as identity primary key,
  demo_day_id    bigint not null references lp_demo_days(id) on delete cascade,
  enrollment_id  bigint not null references lp_enrollments(id) on delete cascade,
  position       int not null default 0,
  startup_name   text,
  one_liner      text,
  pitch_url      text,
  deck_url       text,
  brief          text,
  created_at     timestamptz not null default now(),
  unique (demo_day_id, enrollment_id)
);

create table if not exists lp_posts (
  id             bigint generated always as identity primary key,
  enrollment_id  bigint not null references lp_enrollments(id) on delete cascade,
  pod_id         bigint not null references lp_pods(id) on delete cascade,
  body           text not null,
  created_at     timestamptz not null default now()
);
create index if not exists lp_posts_pod on lp_posts (pod_id, created_at desc);

alter table lp_posts        enable row level security;
alter table lp_batches      enable row level security;
alter table lp_pods         enable row level security;
alter table lp_enrollments  enable row level security;
alter table lp_submissions  enable row level security;
alter table lp_demo_days    enable row level security;
alter table lp_rankings     enable row level security;
alter table lp_finalists    enable row level security;

revoke all on lp_batches, lp_pods, lp_enrollments, lp_submissions, lp_demo_days, lp_rankings, lp_finalists, lp_posts from anon, authenticated;
