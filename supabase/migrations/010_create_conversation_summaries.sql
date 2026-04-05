-- Conversation summaries: stores AI-generated summaries of user conversations about sub-posts
-- Full conversation messages are ephemeral (client-side only); only the summary persists.

create table public.conversation_summaries (
  id           uuid primary key default gen_random_uuid(),
  sub_post_id  uuid not null references public.sub_posts(id) on delete cascade,
  post_id      uuid not null references public.posts(id) on delete cascade,
  user_id      uuid not null references public.users(id) on delete cascade,
  question     text not null,
  key_insights text[] not null,
  created_at   timestamptz not null default now()
);

create index idx_conv_summaries_sub_post on public.conversation_summaries (sub_post_id, created_at desc);
create index idx_conv_summaries_user on public.conversation_summaries (user_id);

alter table public.conversation_summaries enable row level security;

-- SELECT: own summaries always visible; others' summaries only on public snippers
create policy "summaries_select" on public.conversation_summaries
  for select using (
    user_id = auth.uid()
    or post_id in (
      select p.id from public.posts p
      join public.snippers s on s.id = p.snipper_id
      where s.is_public = true
    )
  );

-- INSERT: authenticated users can create their own summaries
create policy "summaries_insert" on public.conversation_summaries
  for insert with check (auth.uid() = user_id);
