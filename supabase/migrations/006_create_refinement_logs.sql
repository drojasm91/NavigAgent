-- Captures refinement chat messages during agent creation, even if the agent is never activated
create table public.refinement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  agent_type text not null,
  topic text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  agent_name text,
  created_at timestamptz not null default now()
);

create index on public.refinement_logs (user_id, created_at);
create index on public.refinement_logs (session_id);

alter table public.refinement_logs enable row level security;

-- Users can insert their own logs
create policy "refinement_logs_insert_own" on public.refinement_logs
  for insert with check (auth.uid() = user_id);

-- Users can read their own logs
create policy "refinement_logs_select_own" on public.refinement_logs
  for select using (auth.uid() = user_id);
