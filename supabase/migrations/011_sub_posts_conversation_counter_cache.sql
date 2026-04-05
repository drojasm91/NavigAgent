-- Counter cache for conversation summaries on sub_posts.
-- Avoids a separate count query every time the feed renders.
-- Kept in sync automatically via trigger on conversation_summaries insert/delete.

alter table public.sub_posts
  add column conversation_count integer not null default 0;

-- Backfill existing sub-posts with current counts
update public.sub_posts
  set conversation_count = (
    select count(*) from public.conversation_summaries
    where sub_post_id = public.sub_posts.id
  );

-- Trigger function: increments/decrements the count on summary insert/delete.
-- security definer so it bypasses RLS for the internal UPDATE.
create or replace function public.sync_sub_post_conversation_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'INSERT') then
    update public.sub_posts
      set conversation_count = conversation_count + 1
      where id = new.sub_post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.sub_posts
      set conversation_count = greatest(0, conversation_count - 1)
      where id = old.sub_post_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger conversation_summaries_count_sync
after insert or delete on public.conversation_summaries
for each row execute function public.sync_sub_post_conversation_count();
