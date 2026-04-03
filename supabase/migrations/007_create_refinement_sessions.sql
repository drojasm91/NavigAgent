-- Tracks creation flow outcomes: which refinement sessions led to activation
create table public.refinement_sessions (
  session_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_type text not null,
  topic text not null,
  agent_name text,
  agent_id uuid references public.user_agents(id) on delete set null,
  activated boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.refinement_sessions (user_id, created_at);

alter table public.refinement_sessions enable row level security;

create policy "refinement_sessions_insert_own" on public.refinement_sessions
  for insert with check (auth.uid() = user_id);

create policy "refinement_sessions_select_own" on public.refinement_sessions
  for select using (auth.uid() = user_id);

create policy "refinement_sessions_update_own" on public.refinement_sessions
  for update using (auth.uid() = user_id);
