-- ============================================================
-- Snipper Rebrand Migration
-- Renames user_agents → snippers, user_agent_subscriptions → snipper_subscriptions
-- Renames enum user_agent_type → snipper_type
-- Renames agent_id columns → snipper_id across all tables
-- ============================================================

-- ── Rename tables ───────────────────────────────────────────
alter table public.user_agents rename to snippers;
alter table public.user_agent_subscriptions rename to snipper_subscriptions;

-- ── Rename enum type ────────────────────────────────────────
alter type user_agent_type rename to snipper_type;

-- ── Rename columns ──────────────────────────────────────────
alter table public.snipper_subscriptions rename column agent_id to snipper_id;
alter table public.posts rename column agent_id to snipper_id;
alter table public.jobs rename column agent_id to snipper_id;
alter table public.refinement_sessions rename column agent_id to snipper_id;

-- ── Drop old RLS policies (snippers, formerly user_agents) ──
drop policy if exists "user_agents_select_public" on public.snippers;
drop policy if exists "user_agents_insert_own" on public.snippers;
drop policy if exists "user_agents_update_own" on public.snippers;
drop policy if exists "user_agents_delete_own" on public.snippers;

-- ── Recreate RLS policies for snippers ──────────────────────
create policy "snippers_select_public" on public.snippers
  for select using (is_public = true or auth.uid() = owner_id);
create policy "snippers_insert_own" on public.snippers
  for insert with check (auth.uid() = owner_id);
create policy "snippers_update_own" on public.snippers
  for update using (auth.uid() = owner_id);
create policy "snippers_delete_own" on public.snippers
  for delete using (auth.uid() = owner_id);

-- ── Drop old RLS policies (snipper_subscriptions, formerly user_agent_subscriptions) ──
drop policy if exists "subscriptions_select_own" on public.snipper_subscriptions;
drop policy if exists "subscriptions_insert_own" on public.snipper_subscriptions;
drop policy if exists "subscriptions_update_own" on public.snipper_subscriptions;
drop policy if exists "subscriptions_delete_own" on public.snipper_subscriptions;

-- ── Recreate RLS policies for snipper_subscriptions ─────────
create policy "snipper_subscriptions_select_own" on public.snipper_subscriptions
  for select using (auth.uid() = user_id);
create policy "snipper_subscriptions_insert_own" on public.snipper_subscriptions
  for insert with check (auth.uid() = user_id);
create policy "snipper_subscriptions_update_own" on public.snipper_subscriptions
  for update using (auth.uid() = user_id);
create policy "snipper_subscriptions_delete_own" on public.snipper_subscriptions
  for delete using (auth.uid() = user_id);

-- ── Drop and recreate posts policies (reference renamed table/column) ──
drop policy if exists "posts_select" on public.posts;
drop policy if exists "posts_insert_owner" on public.posts;

create policy "posts_select" on public.posts
  for select using (
    exists (
      select 1 from public.snippers s
      where s.id = snipper_id
        and (
          s.is_public = true
          or s.owner_id = auth.uid()
          or exists (
            select 1 from public.snipper_subscriptions ss
            where ss.snipper_id = s.id and ss.user_id = auth.uid()
          )
        )
    )
  );

create policy "posts_insert_owner" on public.posts
  for insert with check (
    exists (
      select 1 from public.snippers s
      where s.id = snipper_id and s.owner_id = auth.uid()
    )
  );

-- ── Drop and recreate sub_posts policies ────────────────────
drop policy if exists "sub_posts_select" on public.sub_posts;
drop policy if exists "sub_posts_insert_owner" on public.sub_posts;

create policy "sub_posts_select" on public.sub_posts
  for select using (
    exists (
      select 1 from public.posts p
      join public.snippers s on s.id = p.snipper_id
      where p.id = post_id
        and (
          s.is_public = true
          or s.owner_id = auth.uid()
          or exists (
            select 1 from public.snipper_subscriptions ss
            where ss.snipper_id = s.id and ss.user_id = auth.uid()
          )
        )
    )
  );

create policy "sub_posts_insert_owner" on public.sub_posts
  for insert with check (
    exists (
      select 1 from public.posts p
      join public.snippers s on s.id = p.snipper_id
      where p.id = post_id and s.owner_id = auth.uid()
    )
  );

-- ── Drop and recreate jobs policies ─────────────────────────
drop policy if exists "jobs_select_own" on public.jobs;
drop policy if exists "jobs_insert_owner" on public.jobs;

create policy "jobs_select_own" on public.jobs
  for select using (
    exists (
      select 1 from public.snippers s
      where s.id = snipper_id and s.owner_id = auth.uid()
    )
  );

create policy "jobs_insert_owner" on public.jobs
  for insert with check (
    exists (
      select 1 from public.snippers s
      where s.id = snipper_id and s.owner_id = auth.uid()
    )
  );
