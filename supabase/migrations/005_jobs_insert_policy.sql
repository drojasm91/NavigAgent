-- Allow agent owners to insert jobs for their agents
create policy "jobs_insert_owner" on public.jobs
  for insert with check (
    exists (
      select 1 from public.user_agents ua
      where ua.id = agent_id and ua.owner_id = auth.uid()
    )
  );
