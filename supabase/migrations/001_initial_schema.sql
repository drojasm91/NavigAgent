-- ============================================================
-- NavigAgent — Initial Schema Migration
-- All tables from CLAUDE.md Section 5
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────

create type user_tier as enum ('beta', 'free', 'paid');
create type user_agent_type as enum ('news', 'learning', 'recommendation');
create type cadence as enum ('daily', 'weekly');
create type post_type as enum ('thread', 'card');
create type signal_type as enum ('like', 'skip', 'read_full', 'asked_question', 'rabbit_hole_entered');
create type job_status as enum ('pending', 'running', 'completed', 'failed');

-- ── Tables ───────────────────────────────────────────────────

-- users
-- Mirrors auth.users — populated via trigger on signup.
create table public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  name          text not null,
  avatar_url    text,
  tier          user_tier not null default 'beta',
  location      text,
  created_at    timestamptz not null default now(),
  last_active_at timestamptz
);

-- user_agents
create table public.user_agents (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references public.users(id) on delete cascade,
  name          text not null,
  type          user_agent_type not null,
  description   text not null,
  topic_tags    text[] not null default '{}',
  prompt_config jsonb not null default '{}',
  cadence       cadence not null default 'daily',
  cadence_time  time,
  is_public     boolean not null default false,
  is_active     boolean not null default true,
  last_run_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- user_agent_subscriptions
create table public.user_agent_subscriptions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  agent_id          uuid not null references public.user_agents(id) on delete cascade,
  curriculum_pointer integer not null default 0,
  subscribed_at     timestamptz not null default now(),
  unique (user_id, agent_id)
);

-- posts
create table public.posts (
  id                  uuid primary key default gen_random_uuid(),
  agent_id            uuid not null references public.user_agents(id) on delete cascade,
  type                post_type not null,
  curriculum_position integer,
  metadata            jsonb,
  quality_score       float,
  created_at          timestamptz not null default now()
);

-- sub_posts
create table public.sub_posts (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  position   integer not null,
  content    text not null check (char_length(content) <= 280),
  created_at timestamptz not null default now()
);

-- likes
create table public.likes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  post_id     uuid not null references public.posts(id) on delete cascade,
  signal_type signal_type not null,
  created_at  timestamptz not null default now(),
  unique (user_id, post_id, signal_type)
);

-- jobs
create table public.jobs (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid not null references public.user_agents(id) on delete cascade,
  status       job_status not null default 'pending',
  triggered_at timestamptz not null default now(),
  completed_at timestamptz,
  error        text
);

-- ── Indexes ──────────────────────────────────────────────────

create index on public.user_agents (owner_id);
create index on public.user_agents (is_public, is_active);
create index on public.user_agents using gin (topic_tags);
create index on public.user_agent_subscriptions (user_id);
create index on public.user_agent_subscriptions (agent_id);
create index on public.posts (agent_id, created_at desc);
create index on public.posts (agent_id, curriculum_position);
create index on public.sub_posts (post_id, position);
create index on public.likes (user_id);
create index on public.likes (post_id);
create index on public.jobs (agent_id, status);
create index on public.jobs (status, triggered_at);

-- ── Auth trigger: auto-create user profile on signup ─────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Row Level Security ────────────────────────────────────────

alter table public.users enable row level security;
alter table public.user_agents enable row level security;
alter table public.user_agent_subscriptions enable row level security;
alter table public.posts enable row level security;
alter table public.sub_posts enable row level security;
alter table public.likes enable row level security;
alter table public.jobs enable row level security;

-- users: own row only
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);
create policy "users_update_own" on public.users
  for update using (auth.uid() = id);

-- user_agents: owner has full access; anyone can read public agents
create policy "user_agents_select_public" on public.user_agents
  for select using (is_public = true or auth.uid() = owner_id);
create policy "user_agents_insert_own" on public.user_agents
  for insert with check (auth.uid() = owner_id);
create policy "user_agents_update_own" on public.user_agents
  for update using (auth.uid() = owner_id);
create policy "user_agents_delete_own" on public.user_agents
  for delete using (auth.uid() = owner_id);

-- user_agent_subscriptions: own rows only
create policy "subscriptions_select_own" on public.user_agent_subscriptions
  for select using (auth.uid() = user_id);
create policy "subscriptions_insert_own" on public.user_agent_subscriptions
  for insert with check (auth.uid() = user_id);
create policy "subscriptions_update_own" on public.user_agent_subscriptions
  for update using (auth.uid() = user_id);
create policy "subscriptions_delete_own" on public.user_agent_subscriptions
  for delete using (auth.uid() = user_id);

-- posts: readable if the parent user_agent is public or owned
create policy "posts_select" on public.posts
  for select using (
    exists (
      select 1 from public.user_agents ua
      where ua.id = agent_id
        and (ua.is_public = true or ua.owner_id = auth.uid())
    )
  );

-- sub_posts: readable if the parent post is readable (mirrors posts policy)
create policy "sub_posts_select" on public.sub_posts
  for select using (
    exists (
      select 1 from public.posts p
      join public.user_agents ua on ua.id = p.agent_id
      where p.id = post_id
        and (ua.is_public = true or ua.owner_id = auth.uid())
    )
  );

-- likes: own rows only
create policy "likes_select_own" on public.likes
  for select using (auth.uid() = user_id);
create policy "likes_insert_own" on public.likes
  for insert with check (auth.uid() = user_id);
create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);

-- jobs: readable by owner of the agent
create policy "jobs_select_own" on public.jobs
  for select using (
    exists (
      select 1 from public.user_agents ua
      where ua.id = agent_id and ua.owner_id = auth.uid()
    )
  );
