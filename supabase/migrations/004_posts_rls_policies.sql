-- Add INSERT policies for posts and sub_posts (missing from initial schema)
-- Add subscriber access to SELECT policies

-- Allow agent owners to insert posts for their agents
create policy "posts_insert_owner" on public.posts
  for insert with check (
    exists (
      select 1 from public.user_agents ua
      where ua.id = agent_id and ua.owner_id = auth.uid()
    )
  );

-- Allow agent owners to insert sub_posts for their agents' posts
create policy "sub_posts_insert_owner" on public.sub_posts
  for insert with check (
    exists (
      select 1 from public.posts p
      join public.user_agents ua on ua.id = p.agent_id
      where p.id = post_id and ua.owner_id = auth.uid()
    )
  );

-- Update SELECT policies to also allow subscribers to read posts
drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts
  for select using (
    exists (
      select 1 from public.user_agents ua
      where ua.id = agent_id
        and (
          ua.is_public = true
          or ua.owner_id = auth.uid()
          or exists (
            select 1 from public.user_agent_subscriptions s
            where s.agent_id = ua.id and s.user_id = auth.uid()
          )
        )
    )
  );

drop policy if exists "sub_posts_select" on public.sub_posts;
create policy "sub_posts_select" on public.sub_posts
  for select using (
    exists (
      select 1 from public.posts p
      join public.user_agents ua on ua.id = p.agent_id
      where p.id = post_id
        and (
          ua.is_public = true
          or ua.owner_id = auth.uid()
          or exists (
            select 1 from public.user_agent_subscriptions s
            where s.agent_id = ua.id and s.user_id = auth.uid()
          )
        )
    )
  );
