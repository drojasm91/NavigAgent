ALTER TABLE public.users ADD COLUMN vibes text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN topics text[] NOT NULL DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN free_text text NOT NULL DEFAULT '';
