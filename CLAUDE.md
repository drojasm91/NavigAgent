# Snipper — App Bible (CLAUDE.md)

This file is the source of truth for the Snipper project. Read this at the start of every session before writing any code. When in doubt about any decision, refer back to this document. Update section 11 every time a feature is completed.

---

## 0. Identity & Mission — Snipper

**App name:** Snipper

**One-liner:** Your AI experts, snipping through the noise.

**What a Snipper is:**
A Snipper is a tireless AI expert that cuts through the infinite stream of information and delivers only the pieces that matter to you. It researches, thinks, writes, and serves — so you never have to sift through noise again. Every Snipper is specialized, opinionated, and relentlessly focused on its domain. You don't search. You don't scroll. Your Snippers bring you what's worth knowing.

**The metaphor — and why it matters:**
The world produces more content in a day than any person could consume in a lifetime. Traditional feeds solve this by showing you what's popular or what keeps you engaged. Snipper solves it differently: instead of an algorithm deciding what you see, you build a team of AI experts — Snippers — each one laser-focused on a topic you actually care about. They snip the signal from the noise and deliver it in sharp, punchy, expert-level posts.

Think of it as: **you are the editor-in-chief, and your Snippers are your newsroom.**

**Core identity pillars:**
1. **Snipping = curation with expertise.** A Snipper doesn't just filter — it researches, synthesizes, and writes. The "snip" is the final, polished piece of content it delivers: the sharpest angle, the most surprising insight, the one thing you need to know.
2. **Every Snipper has a voice.** Snippers aren't robotic summarizers. Each one has a distinct perspective shaped by its topic and the user's preferences. "The Southeast Asia Lens" doesn't sound like "Crypto Pulse." They have personality.
3. **High-signal, zero homework.** The experience is social-media-addictive, not educational-app-tedious. Users should feel like they're getting insider knowledge from someone brilliant, not reading a textbook.
4. **You build the team.** The power is in the composition — which Snippers you subscribe to defines your unique feed. No two users have the same Snipper lineup, and no two feeds look the same.

**UI copy voice:**
- Confident, sharp, slightly playful. Never corporate, never robotic.
- "Your Snippers" (possessive) when referring to a user's subscribed Snippers.
- "Create a Snipper" not "Create an agent."
- "This Snipper covers..." not "This agent generates content about..."
- The feed is "your feed" — never "the feed" or "your content."

**What Snipper is NOT:**
- Not an RSS reader — Snippers don't just fetch and reformat. They think.
- Not a learning platform — even learning-type Snippers feel like following an expert on social media, not taking a course.
- Not a news aggregator — Snippers have angles and opinions. They don't just list headlines.
- Not a chatbot — users don't converse with Snippers. Snippers publish to your feed like expert accounts you follow.

**Naming convention — critical:**

"Snipper" is the universal term — in code, database, UI, conversation, everywhere. This eliminates all ambiguity.

- **Snipper** — the thing users create and subscribe to. A specialized AI configuration that researches, writes, and delivers content on a topic. This is what was previously called "user-agent."
- **Agent** — an internal pipeline actor that performs a step in content generation (Researcher agent, Writer agent). Users never see this term. Only used in code and technical discussion about the pipeline.

Because these are two completely different words, there is zero confusion. When Diego says "snipper," it always means the user-created entity. When he says "agent," it always means a pipeline step.

**Rename mapping (from old → new):**
- DB tables: `user_agents` → `snippers`, `user_agent_subscriptions` → `snipper_subscriptions`
- DB enum: `user_agent_type` → `snipper_type`
- Code variables: `userAgent` → `snipper`, `UserAgent` → `Snipper`
- Types: `UserAgentType` → `SnipperType`
- File paths: `/components/agents/` → `/components/snippers/`, `/components/agent-profile/` → `/components/snipper-profile/`
- Route: `/agent/[agentId]` → `/snipper/[snipperId]`
- Prompts & templates: all references to "user-agent" → "snipper"
- The word "agent" alone now **only** refers to pipeline agents (Researcher, Writer). Never use "agent" to mean a Snipper.

---

## 1. App Overview

Snipper is a personalized AI-powered feed app where users create and subscribe to **Snippers** — each one a specialized AI expert that researches, writes, and delivers content tailored to a specific topic the user cares about. The feed looks and feels like a social media app, but every post is AI-generated, deeply personalized, and genuinely informative.

The core value proposition: instead of doomscrolling through noise, users open Snipper and find a feed curated by a team of world-class AI experts — one for geopolitics, one for ancient history, one for restaurant picks, one for crypto — all working silently in the background.

Snipper is **not** a learning app, a news aggregator, or an RSS reader. It is a social media feed that makes you smarter. The experience should feel like the best version of early Twitter — punchy, expert, high-signal posts that make you want to keep reading. Users should feel like they are consuming great content, not doing homework.

**Current stage:** MVP — private beta for founder and a small group of friends.

---

## 2. Core Concepts & Vocabulary

Use these terms consistently everywhere — in code, comments, database columns, UI copy, and prompts.

**Snipper** — a configuration created by a user defining a topic, type, tone preferences, and cadence. Generates posts on a schedule. Not a post. Not a feed. Names are always AI-generated — users cannot name or rename them. Names reflect the specific angle (e.g. "The Southeast Asia Lens" not "Geopolitics News").

**Pipeline agent** — one of the two pipeline steps: Researcher or Writer. Internal infrastructure. Users never see these.

**Snipper type** — determines which pipeline runs and how content is displayed. Types: `news`, `learning`, `recommendation`.

**Post** — a single piece of AI-generated content. For `news` and `learning` types: a thread of sub-posts. For `recommendation`: a single card. Every post has a `language` field matching the subscriber's language preference.

**Thread** — a structured sequence of sub-posts. Min 3, max 10 — Writer decides based on complexity. First sub-post is the hook shown in the feed.

**Sub-post** — a single unit within a thread. Max 280 characters. Each must pull the reader to the next.

**Inline Expansion** — tapping a post card expands it in-place to show sub-posts 2+ below the hook. Last sub-post shows "Dig In." Collapse chevron scrolls back to card top.

**Feed** — main screen. Post cards from followed Snippers and community recommendations. Tapping expands the card inline.

**Dig In** — button on last sub-post of a thread in the feed. Takes user to the snipper profile page with the Posts tab open (`/snipper/[snipperId]?tab=posts`).

**Rabbit Hole** — the experience of diving deep into one Snipper's content. Not a standalone page — it's the Posts tab on the snipper profile page. Curriculum order for learning, newest-first (last 14 days) for news. May include recommended posts from similar Snippers.

**Curriculum** — ordered sequence of posts for a learning Snipper. Each post has a `curriculum_position`.

**Curriculum Pointer** — per-user, per-learning-Snipper integer tracking current position. Advances by 1 each time a post is read.

**Curriculum Buffer** — always generate 5 posts ahead of the furthest pointer. Show "You're all caught up — next lesson coming soon" at buffer end.

**Community Feed** — posts from other users' public Snippers when user has fewer than 5 unread posts from their own Snippers.

**Like Signal** — user engagement action feeding the personalization loop. Types: `like`, `skip`, `read_full`, `asked_question`, `rabbit_hole_entered`.

**Personalization Loop** — weekly process reading like signals and updating each Snipper's `prompt_config`.

**Pipeline** — two-step sequence per job. Step 1: Research & Plan. Step 2: Write & Self-edit. Learning Snippers skip Step 1. Every run is completely isolated — no shared state.

**Duplicate Detection** — simple DB query on creation. Checks if similar public Snipper exists and suggests following instead.

**Multilingual Posts** — language lives on `snipper_subscriptions`. Same Snipper serves English to one subscriber and Spanish to another. Writer generates natively — never translates.

---

## 3. Tech Stack

**Frontend**
- Next.js 14 (App Router)
- Tailwind CSS
- Shadcn/ui for base components
- Mobile-first layout — large touch targets, no hover-dependent interactions

**Backend**
- Supabase — database, auth, real-time
- PostgreSQL via Supabase
- Row Level Security (RLS) enabled on all tables

**Agentic Infrastructure**
- Trigger.dev — job scheduling, background jobs, pipeline orchestration
- Perplexity API — real-time web research (news and recommendation types only)
- Anthropic Claude API:
  - `claude-sonnet-4-20250514` — all Writer steps
  - `claude-haiku-4-5-20251001` — all Researcher steps

**Deployment**
- Vercel — Next.js frontend
- Supabase cloud — database and auth
- Trigger.dev cloud — background jobs

**Why Trigger.dev over Vercel Cron:**
Vercel Cron has a 60-second timeout and no job queue. With many users and Snippers running simultaneously it would require a full rewrite. Trigger.dev handles proper queuing, retries, and parallel execution from day one. Extra setup cost: 30 minutes. Benefit: never rewrite the scheduling layer.

**Why Perplexity over Tavily:**
Perplexity does search AND synthesis in one API call — returns a researched brief ready to pass to the Writer. Tavily returns raw results requiring a separate Claude synthesis call. Perplexity simplifies Step 1 and produces higher quality research.

---

## 4. App Structure & Screens

**/ — Main Feed**
Infinite scroll of post cards. Tapping expands the card inline to show remaining sub-posts. Community posts visually distinct with label and Follow/Unfollow button. When fewer than 5 unread posts from own Snippers, community posts auto-append.

**Inline Thread Expansion**
Tapping a post card body expands it in-place to show sub-posts 2+ below the hook (sub-post 1 is never repeated). Expanded view includes: numbered sub-posts with connecting lines, like button, "Dig In" button, and collapse chevron. Collapsing scrolls back to the card top (with scroll-margin for sticky header). No modal/bottom sheet.

**Post Card — Three Tap Zones**
- Avatar + snipper name (top left) → snipper profile page (Info tab). Press feedback: opacity dim.
- Bot icon (top right, next to timestamp) → snipper profile page (Posts tab). Press feedback: background accent. Hidden when viewing that Snipper's own Posts tab.
- Card body + footer → expands card inline to show remaining sub-posts. Press feedback: scale animation.

**/snipper/[snipperId] — Unified Snipper Profile Page**

Two tabs: **Info** and **Posts**. URL param `?tab=posts` controls active tab. Default = Info.

Header (compact, 2-3 rows): back button + avatar + name + type badge + Follow button (row 1). Topic tags + stats (row 2). "Researching new content..." pulsing indicator (row 3, only when background generation is active).

**Info tab:** Snipper description, stats grid (total posts, avg quality, type, cadence), top posts by quality score.

**Posts tab (the rabbit hole):** Same UI as feed but scoped to one Snipper. Reuses FeedList + PostCard with `hideDigIn`. Curriculum order for learning, newest-first for news. "Dig In" and Bot icon hidden for current Snipper's posts. May include recommended posts from similar Snippers in the future.

**/snippers** — manage own Snippers. Sticky `+` create button in header (always visible). Type filter chips (All / News / Learning / Recommendations) for navigating a growing list.

**/snippers/new** — create flow (4 steps, progressive):
1. Choose type (news / learning / recommendation)
2. Pick topic (from suggested list or write custom — arrow icon navigates forward)
3. AI-generated follow-up questions (tap options to refine preferences, custom answers merge inline)
4. Snipper preview + sample post (progressive — name/description appear first, then sample auto-generates below):
   - Refinement chat: below the sample, user can chat with AI to adjust tone/focus (e.g. "Make it more technical"). AI confirms, then preview + sample regenerate with refinement applied.
   - "Show me another sample" link below sample (passes previous hooks for dedup)
   - "Activate Snipper" sticky CTA
   - After activation: redirects to snipper profile, auto-generates 2 more posts in background (up to 3 total)

**/discover** — quality-ranked community Snippers. Never alphabetical.

**/post/[postId]/ask** — ask follow-up questions with full thread context.

**/settings** — preferences, notifications, tier, account.

---

## 5. Data Models

**users**
- id (uuid, pk)
- email
- name
- avatar_url
- tier (enum: beta, free, paid) default: beta
- location (text, optional)
- onboarding_completed (boolean, default: false)
- vibes (text[], default: '{}') — selected vibe IDs from onboarding
- topics (text[], default: '{}') — selected topic IDs (predefined + custom:* IDs)
- free_text (text, default: '') — JSON with custom topic metadata
- created_at
- last_active_at

**snippers**
- id (uuid, pk)
- owner_id (fk → users.id)
- name (text — AI-generated, never user-editable)
- type (enum: news, learning, recommendation)
- description (text — user-provided context)
- topic_tags (text[] — for duplicate detection and community matching)
- prompt_config (jsonb — stores `{ refinementInstructions, refinementChat }` from creation flow + personalization loop updates. Passed to researcher and writer as `promptConfig`. Never exposed to frontend)
- cadence (enum: daily, weekly) default: daily
- cadence_time (time UTC)
- is_public (boolean)
- is_active (boolean)
- last_run_at (timestamp)
- created_at

**snipper_subscriptions**
- id (uuid, pk)
- user_id (fk → users.id)
- snipper_id (fk → snippers.id)
- language (text, default: 'en') — language this subscriber receives posts in
- curriculum_pointer (integer default 0 — learning Snippers only)
- subscribed_at
- UNIQUE(user_id, snipper_id)

**posts**
- id (uuid, pk)
- snipper_id (fk → snippers.id)
- language (text) — language this post was written in
- type (enum: thread, card)
- curriculum_position (integer, nullable — learning Snippers only)
- metadata (jsonb — `{ sources: [{url, label}], angle, isBreaking }` from Perplexity research. Sources displayed as collapsible section in expanded posts)
- quality_score (float, nullable — set by Writer self-edit)
- created_at

**sub_posts**
- id (uuid, pk)
- post_id (fk → posts.id)
- position (integer, 1-indexed)
- content (text, max 280 characters)
- created_at

**likes**
- id (uuid, pk)
- user_id (fk → users.id)
- post_id (fk → posts.id)
- signal_type (enum: like, skip, read_full, asked_question, rabbit_hole_entered)
- created_at
- UNIQUE(user_id, post_id, signal_type)

**jobs**
- id (uuid, pk)
- snipper_id (fk → snippers.id)
- language (text) — language this job is generating for
- status (enum: pending, running, completed, failed)
- triggered_at
- completed_at
- error (text, nullable)

**refinement_logs** (captures chat messages during Snipper creation, even if not activated)
- id (uuid, pk)
- user_id (fk → users.id)
- session_id (text)
- agent_type (text)
- topic (text)
- role (text — 'user' | 'assistant')
- content (text)
- agent_name (text, nullable)
- created_at

**refinement_sessions** (tracks creation flow outcomes — activated vs abandoned)
- session_id (text, pk)
- user_id (fk → users.id)
- agent_type (text)
- topic (text)
- agent_name (text, nullable)
- snipper_id (fk → snippers.id, nullable — set on activation)
- activated (boolean, default false)
- created_at

---

## 6. Snipper Catalog

Pre-built templates. Context fields pre-filled and editable. AI generates name after user confirms.

### Stay Sharp
Industry news · Startup radar · Job market pulse · Regulatory changes · Competitor tracker · Geopolitics daily · Macroeconomy pulse · Stock market weekly · Crypto & web3 · Technology updates

### Get Smarter
Concept a day · History rabbit holes · Language learning drip · How things work · Philosophy debate · Science frontiers · Travel prep · "Other side" steelman

### Live Better
Restaurant picks · Local events · What to watch · Music discovery · Sports briefing · Personal finance · Fitness & nutrition

### Think Deeper
Contrarian takes · Ethics dilemma · Geopolitics deep dive

### Build Things
Prompt engineering · No-code tricks · Creator economy · Design inspiration

---

## 7. Agentic System Architecture

### Overview

Three layers, communicate only through Supabase:

- **Layer 1 — Scheduler:** Trigger.dev hourly cron. Creates one job per unique language among subscribers.
- **Layer 2 — Pipeline:** Two-step Trigger.dev jobs. Completely isolated — no shared state.
- **Layer 3 — Personalization Loop:** Trigger.dev weekly cron. Updates `prompt_config`.

**Core scalability principle:** Every pipeline run is a stateless isolated job. Scaling = running more jobs in parallel. Trigger.dev handles this automatically.

---

### Layer 1 — Scheduler

Runs every hour.

For each active Snipper:
1. Has cadence interval passed since `last_run_at`?
2. Do any subscribers have fewer than 5 unread posts?

If both true → create one job per unique language among subscribers.

**Tier limits:** beta = max 10 Snippers, daily cadence only.

---

### Layer 2 — Two-Step Pipeline

Each step is a pure stateless function: `(input) => output`. If a step fails after 2 retries, mark job failed and move on.

---

#### News Pipeline

**Step 1 — Research, Fact-check & Plan** (claude-haiku + Perplexity)
- Query Perplexity API — receives researched synthesis with citations
- Check for breaking events overriding repetition rules (major development in last 24h)
- Check recent posts to avoid repetition
- Decide angle based on `prompt_config`
- Output: structured JSON brief (findings, angle, framing, topics to avoid, breaking flag, sources)

**Step 2 — Write & Self-edit** (claude-sonnet)
- Input: research brief, snipper config, `prompt_config`, target language
- Write thread of 3-10 sub-posts
- Self-review using checklist
- Output: final sub-posts array + quality score

**Thread format:**
- Sub-post 1 (Hook): most interesting or underexplored angle. Standalone. Max 280 chars.
- Sub-post 2 (Expansion): explains hook, introduces tension or open question. Max 280 chars.
- Sub-post 3+ (Depth): one idea per sub-post. Max 280 chars each.
- Second-to-last (Twist): introduces a complication or competing perspective. Max 280 chars.
- Final (Landing): closes hook, leaves the reader with a question worth sitting with. Max 280 chars.

**Writer voice rules (enforce in every prompt):**
- Truth-seeker — an expert with a forever-student mindset
- Present evidence and perspectives, not conclusions. Let the reader decide.
- Show what's known, what's uncertain, and what's contested
- Ask the question the reader should be asking — don't answer it for them
- Be direct and punchy, but epistemically humble — say "suggests" not "proves"
- Use terminology freely but always earn it with a plain explanation
- Goal: make the reader think, not tell them what to think
- No bullet points, no headers, no "In this post we will cover"
- One idea per sub-post, depth and personality
- If it sounds like Wikipedia, rewrite it. If it sounds like an op-ed, soften it.
- Never start with "In conclusion" or "To summarize"
- Write natively in target language — never translate
- Stop when landing is clean

**Self-edit checklist:**
- Sub-post 1 demands the next?
- Each sub-post pulls to the next?
- Final sub-post lands cleanly?
- Content is new vs recent posts?
- Matches topic and user preferences?
- Respects all voice rules?
- Written natively in target language?

---

#### Learning Pipeline (Step 2 only — no Perplexity)

**Step 2 — Write & Self-edit** (claude-sonnet)
- Input: snipper config, full post history, curriculum pointers of all subscribers, `prompt_config`, target language
- Acts as curriculum designer + writer:
  - Determine next logical step in learning progression
  - Do not repeat covered topics
  - Build knowledge progressively
  - Stay 5 posts ahead of most advanced subscriber
  - Write thread natively in target language
  - Self-review with same checklist

Additional voice rules:
- User should feel they discovered something, not completed a lesson
- Never use educational framing
- Hook = most counterintuitive fact about the topic

Output: sub-posts array + `curriculum_position` + quality score

---

#### Recommendation Pipeline

**Step 1 — Research & Plan** (claude-haiku + Perplexity)
- Query Perplexity with location and criteria
- Avoid recent repeats
- Output: top 1-3 options with details

**Step 2 — Write & Self-edit** (claude-sonnet)
- Single recommendation card. Max 400 chars.
- Name, one-line hook, why it's worth it, practical info
- Written natively in target language

---

### Multilingual Generation

Scheduler creates one job per unique language among subscribers. Pipeline receives target language. Writer generates natively. Posts stored with `language` field. Subscribers served posts in their subscription language.

**Rule:** Never translate. Always generate natively.

---

### Layer 3 — Personalization Loop

Weekly per user per Snipper:
1. Read like signals from past 4 weeks
2. Identify engagement patterns
3. Generate short instruction update (e.g. "User prefers geopolitical framing over economic data")
4. Merge into `prompt_config`

Never changes topic or type — only framing, angle, depth, style.
Model: claude-haiku

---

### Community Feed Logic

When fewer than 5 unread posts from own Snippers:
1. Query public Snippers with matching `topic_tags`
2. Filter: 10+ posts, quality_score > 0.7
3. Order by recent engagement
4. Label "From the community — [Name]"
5. After engagement → "Follow this Snipper?" with language selector

---

### Discover Page

Always ranked by: reliability score + avg likes + follower growth (last 30 days). Never alphabetical.

---

### Duplicate Detection

On Snipper creation:
1. Extract topic tags
2. Query matching public Snippers (same type + overlapping tags)
3. If strong match → suggest following instead
4. User chooses to follow existing or create new

---

### Refinement Chat (Snipper Creation)

During Snipper creation (Step 4), after the sample post appears, users can chat with AI to refine their Snipper's tone, focus, and style. Uses Claude Haiku with `SNIPPER_REFINEMENT_CHAT_PROMPT`.

Flow: user types feedback → Haiku interprets → returns confirmation + cumulative `refinementInstructions` string → preview + sample regenerate with instructions applied → instructions saved to `prompt_config` on activation.

Chat messages saved to `refinement_logs` in real-time (even if abandoned). Session outcome tracked in `refinement_sessions` (activated/abandoned + snipper_id).

---

### Post Sources

Perplexity citations are saved as `[{url, label}]` in `posts.metadata.sources`. The researcher prompt asks Haiku to extract a descriptive label for each source (e.g. "Luka trade breakdown — ESPN"). Displayed as a collapsible "Sources (N)" section below the last sub-post in expanded thread view. Uses native `<details>/<summary>`.

---

### Post Generation After Activation

When a user activates a Snipper, the profile page auto-generates up to 2 more posts (3 total) via `generateBackgroundPost` server action. Bypasses Trigger.dev for now — runs the full pipeline (Perplexity + Haiku + Sonnet) inline. Shows "Researching new content..." pulsing label in the header while generating. Uses `maxDuration = 120` on page files for Vercel timeout.

---

## 8. UX & Design Principles

1. **Feed first.** Return to feed in one tap from anywhere.
2. **Mobile-first.** No hover states. Large tap targets.
3. **Invisible intelligence.** No prompts, model names, or errors visible to users.
4. **Expert voice.** First principles, terminology earned with plain explanation. Reader feels smart.
5. **Social media tone.** Punchy, epistemically humble. Truth-seeking, not opinionated. Never a lesson.
6. **Threads like Twitter.** Short punchy sub-posts. Each demands the next.
7. **Progress is subtle.** Curriculum label exists but never dominates.
8. **"Dig In" is consistent.** Always means: go to this Snipper's Posts tab on their profile page.
9. **Community content is labeled.** Blends naturally with a small clear label.
10. **Empty states are opportunities.** Never a dead end.
11. **Names are AI-generated and final.** Never show a name input field.
12. **Discover is ranked.** Always quality-ranked. Never alphabetical.
13. **Language is a subscription choice.** Selected when following. Default = browser language.

---

## 9. MVP Scope

### In Scope
- User auth (email/password via Supabase)
- Snipper creation and management (all 3 types)
- Two-step pipeline for all types
- Multilingual generation (language on subscription)
- Duplicate detection on creation
- Inline thread expansion
- "Dig In" navigating to snipper profile Posts tab
- Like signals (like and skip only)
- Community feed fallback
- Discover page with quality ranking
- Unified snipper profile page with Info + Posts tabs
- Ask a question feature
- Scheduler (hourly), Personalization Loop (weekly)
- Pre-built templates (5+ per category)
- Beta tier limits (10 Snippers, daily cadence)
- Basic notification when new posts ready

### Out of Scope for MVP
- Cluster Manager and Research Pool
- Fork / "Build one like this"
- Mobile app (React Native)
- X/Twitter recap agent type
- Audio/podcast format
- Learning onboarding quiz
- Paid tier / billing
- Multiple cadence options
- User-to-user social graph
- External social sharing

---

## 10. Coding Rules & Conventions

**General**
- Always TypeScript, never plain JavaScript
- async/await only, never .then()
- Named exports, not default exports
- All env vars in `.env.local`, documented in `.env.example`
- Never paste secret keys into any chat — add manually to `.env.local`
- Never commit `.env.local` — must be in `.gitignore`

**Naming:**
- DB tables: `snippers` (snake_case)
- Code vars: `snipper` (camelCase)
- Pipeline steps: `researcher`, `writer`
- "Snipper" = user-created entity. "Agent" = pipeline step only.

**Scalability principles — non-negotiable from day one:**
- Every pipeline step is a pure function: `(input) => output`
- Every pipeline run is completely isolated — zero shared state
- No hardcoded values — everything via environment variables
- All DB queries through `/lib/supabase` helpers, never inline
- All prompts are exported constants in `/lib/prompts` — never inline
- Jobs are idempotent — running twice = same result, not duplicates
- Language always passed explicitly — never assumed

**File structure**
```
/app                           Next.js App Router pages
/components
  /ui                          Shadcn base (do not modify)
  /feed                        Feed, post card with inline expansion
  /thread                      Sub-post item component (reused by PostCard)
  /snipper-profile              Unified snipper profile page (Info + Posts tabs)
  /navigation                  Bottom tab bar, page header
  /onboarding                  2-step onboarding flow (vibes → topics)
  /snippers                    Snipper management
/lib
  /supabase                    Supabase client and helpers
  /trigger                     Trigger.dev job definitions
  /pipelines
    /orchestrator.ts            Routes jobs to correct pipeline
    /steps
      /researcher.ts            Step 1 — Research & Plan
      /writer-news.ts           Step 2 — Write (news)
      /writer-learning.ts       Step 2 — Write (learning)
      /writer-recommendation.ts Step 2 — Write (recommendation)
    /personalization-loop.ts    Layer 3
  /prompts                     All Claude prompts as constants
    CLASSIFY_INTEREST_PROMPT     Onboarding topic classification
    SNIPPER_FOLLOWUP_PROMPT      Follow-up questions for creation flow
    SNIPPER_NAME_PROMPT          Snipper name/description generation
    SNIPPER_REFINEMENT_CHAT_PROMPT Interprets user refinement feedback
    NEWS_RESEARCHER_PROMPT       Haiku analyzes Perplexity research
    NEWS_WRITER_PROMPT           Sonnet writes threads
  /perplexity.ts               Perplexity API client
  /types                       Shared TypeScript types
/hooks                         Custom React hooks
```

**Models:** `claude-sonnet-4-20250514` for Writer and onboarding classification. `claude-haiku-4-5-20251001` for Researcher, follow-up questions, snipper naming, and refinement chat.

**Testing:** Tests for every pipeline step, scheduler logic, duplicate detection, and edge cases (empty history, first run, curriculum buffer end, multilingual jobs, breaking override). Run `npm test` before every commit.

**Git:** Commit after every working feature. Format: `[area] description`. Never commit broken code.

**Errors:** Pipeline failures logged to `jobs` table only — never shown to users.

---

## 11. Current Build State

**Completed:**
- ✅ Step 1 — Next.js 14 with Tailwind, Shadcn/ui, TypeScript
- ✅ Step 2 — Supabase connected, all tables migrated (including refinement_logs, refinement_sessions)
- ⏳ Step 3 — Trigger.dev code exists, needs cloud env vars
- ✅ Step 5 — News pipeline fully functional (researcher.ts + writer-news.ts)
- ✅ Step 9 — Main feed UI (post cards with inline thread expansion, bottom tab nav, collapsible sources)
- ✅ Step 10+12 — Unified snipper profile page with Info + Posts tabs, "Researching new content..." indicator
- ✅ Step 11 — Snipper creation flow (type → topic → AI follow-ups → preview + sample + refinement chat → activate)
- ✅ Onboarding — 2-step flow (vibes → topics), AI-powered free text classification with Claude Sonnet
- ✅ My Snippers page — type filter chips, sticky + create button in header
- ✅ Post-activation auto-generation — generates 2 extra posts via server action on snipper profile
- ✅ Refinement chat — saves to refinement_logs + refinement_sessions, persists as prompt_config
- ✅ Labeled sources — Perplexity citations with title + URL, collapsible section in expanded posts
- ✅ RLS policies — INSERT policies for posts, sub_posts, jobs; SELECT policies include subscribers
- ✅ Snipper rebrand — full rename from user-agent to Snipper across DB, types, code, UI, routes, and prompts

**Remaining steps:**
3. Finish Trigger.dev cloud setup (add TRIGGER_SECRET_KEY + TRIGGER_PROJECT_ID to Vercel)
4. Build Layer 1 — Scheduler (one job per snipper per language)
6. Build learning pipeline — writer-learning.ts
7. Build recommendation pipeline — writer-recommendation.ts
8. Build Layer 3 — Personalization Loop
13. Build discover page
14. Build community feed fallback
15. Build ask-a-question feature
16. End-to-end testing
17. Deploy to production (merge to main)

**Update this section every time a step is completed.**

---

*Last updated: Snipper rebrand — full rename from user-agent to Snipper across DB, types, code, UI, routes, prompts, and documentation. Claude Code must re-read this file at the start of every new session.*
