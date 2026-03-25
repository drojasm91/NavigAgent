# NavigAgent — App Bible (CLAUDE.md)

This file is the source of truth for the NavigAgent project. Read this at the start of every session before writing any code. When in doubt about any decision, refer back to this document. Update section 11 every time a feature is completed.

---

## 1. App Overview

NavigAgent is a personalized AI-powered feed app where users create and subscribe to **user-agents** — each one a specialized AI configuration that researches, writes, and delivers content tailored to a specific topic the user cares about. The feed looks and feels like a social media app, but every post is AI-generated, deeply personalized, and genuinely informative.

The core value proposition: instead of doomscrolling through noise, users open NavigAgent and find a feed curated by a team of world-class AI experts — one for geopolitics, one for ancient history, one for restaurant picks, one for crypto — all working silently in the background.

NavigAgent is **not** a learning app, a news aggregator, or an RSS reader. It is a social media feed that makes you smarter. The experience should feel like the best version of early Twitter — punchy, expert, high-signal posts that make you want to keep reading. Users should feel like they are consuming great content, not doing homework.

**Naming convention — critical:**
- **User-agents** — configurations created by users that define a topic, type, and cadence. These are the "agents" users interact with in the UI.
- **System-agents** — the two AI pipeline steps: Researcher and Writer. Internal only, never exposed to users.

**Current stage:** MVP — private beta for founder and a small group of friends.

---

## 2. Core Concepts & Vocabulary

Use these terms consistently everywhere — in code, comments, database columns, UI copy, and prompts.

**User-agent** — a configuration created by a user defining a topic, type, tone preferences, and cadence. Generates posts on a schedule. Not a post. Not a feed. Names are always AI-generated — users cannot name or rename them. Names reflect the specific angle (e.g. "The Southeast Asia Lens" not "Geopolitics News").

**System-agent** — one of the two pipeline steps: Researcher or Writer. Internal infrastructure. Users never see these.

**User-agent type** — determines which pipeline runs and how content is displayed. Types: `news`, `learning`, `recommendation`.

**Post** — a single piece of AI-generated content. For `news` and `learning` types: a thread of sub-posts. For `recommendation`: a single card. Every post has a `language` field matching the subscriber's language preference.

**Thread** — a structured sequence of sub-posts. Min 3, max 10 — Writer decides based on complexity. First sub-post is the hook shown in the feed.

**Sub-post** — a single unit within a thread. Max 280 characters. Each must pull the reader to the next.

**Bottom Sheet** — slides up when a post card is tapped. User scrolls through sub-posts. Last sub-post of a feed post shows "Dig In." Dismissing returns to exact feed position.

**Feed** — main screen. Post cards from followed user-agents and community recommendations. Tapping opens the bottom sheet.

**Dig In** — button on last sub-post of a thread in the feed. Takes user to the agent profile page with the Posts tab open (`/agent/[agentId]?tab=posts`).

**Rabbit Hole** — the experience of diving deep into one agent's content. Not a standalone page — it's the Posts tab on the agent profile page. Curriculum order for learning, newest-first (last 14 days) for news. May include recommended posts from similar agents.

**Curriculum** — ordered sequence of posts for a learning user-agent. Each post has a `curriculum_position`.

**Curriculum Pointer** — per-user, per-learning-agent integer tracking current position. Advances by 1 each time a post is read.

**Curriculum Buffer** — always generate 5 posts ahead of the furthest pointer. Show "You're all caught up — next lesson coming soon" at buffer end.

**Community Feed** — posts from other users' public user-agents when user has fewer than 5 unread posts from their own agents.

**Like Signal** — user engagement action feeding the personalization loop. Types: `like`, `skip`, `read_full`, `asked_question`, `rabbit_hole_entered`.

**Personalization Loop** — weekly process reading like signals and updating each user-agent's `prompt_config`.

**Pipeline** — two-step sequence per job. Step 1: Research & Plan. Step 2: Write & Self-edit. Learning agents skip Step 1. Every run is completely isolated — no shared state.

**Duplicate Detection** — simple DB query on creation. Checks if similar public user-agent exists and suggests following instead.

**Multilingual Posts** — language lives on `user_agent_subscriptions`. Same agent serves English to one subscriber and Spanish to another. Writer generates natively — never translates.

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
Vercel Cron has a 60-second timeout and no job queue. With many users and agents running simultaneously it would require a full rewrite. Trigger.dev handles proper queuing, retries, and parallel execution from day one. Extra setup cost: 30 minutes. Benefit: never rewrite the scheduling layer.

**Why Perplexity over Tavily:**
Perplexity does search AND synthesis in one API call — returns a researched brief ready to pass to the Writer. Tavily returns raw results requiring a separate Claude synthesis call. Perplexity simplifies Step 1 and produces higher quality research.

---

## 4. App Structure & Screens

**/ — Main Feed**
Infinite scroll of post cards. Tapping opens bottom sheet. Community posts visually distinct with label and Follow/Unfollow button. When fewer than 5 unread posts from own agents, community posts auto-append.

**Bottom Sheet — Thread Reader**
Slides up on card body tap. Sub-posts scroll inside sheet. Last sub-post of feed post → "Dig In" button. Last sub-post when on agent's Posts tab → no Dig In (already there). Dismissing returns to previous position.

**Post Card — Three Tap Zones**
- Avatar + agent name (top left) → agent profile page (Info tab). Press feedback: opacity dim.
- ArrowUpRight icon (top right, next to timestamp) → agent profile page (Posts tab). Press feedback: background accent. Hidden when viewing that agent's own Posts tab.
- Card body + footer → opens bottom sheet thread reader. Press feedback: scale animation.

**/agent/[agentId] — Unified Agent Profile Page**

Two tabs: **Info** and **Posts**. URL param `?tab=posts` controls active tab. Default = Info.

Header (compact, 2 rows): back button + avatar + name + type badge + Follow button (row 1). Topic tags + stats (row 2).

**Info tab:** Agent description, stats grid (total posts, avg quality, type, cadence), top posts by quality score.

**Posts tab (the rabbit hole):** Same UI as feed but scoped to one agent. Reuses FeedList + PostCard. Curriculum order for learning, newest-first for news. "Dig In" and ArrowUpRight hidden for current agent's posts. May include recommended posts from similar agents in the future.

**/agents** — manage own user-agents (add, pause, delete)

**/agents/new** — create flow:
1. Choose type or template
2. Add context and preferences
3. Choose language
4. Duplicate check runs
5. Set cadence
6. Preview AI-generated name
7. Activate

**/discover** — quality-ranked community agents. Never alphabetical.

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
- created_at
- last_active_at

**user_agents**
- id (uuid, pk)
- owner_id (fk → users.id)
- name (text — AI-generated, never user-editable)
- type (enum: news, learning, recommendation)
- description (text — user-provided context)
- topic_tags (text[] — for duplicate detection and community matching)
- prompt_config (jsonb — personalization instructions, never exposed to frontend)
- cadence (enum: daily, weekly) default: daily
- cadence_time (time UTC)
- is_public (boolean)
- is_active (boolean)
- last_run_at (timestamp)
- created_at

**user_agent_subscriptions**
- id (uuid, pk)
- user_id (fk → users.id)
- agent_id (fk → user_agents.id)
- language (text, default: 'en') — language this subscriber receives posts in
- curriculum_pointer (integer default 0 — learning agents only)
- subscribed_at
- UNIQUE(user_id, agent_id)

**posts**
- id (uuid, pk)
- agent_id (fk → user_agents.id)
- language (text) — language this post was written in
- type (enum: thread, card)
- curriculum_position (integer, nullable — learning agents only)
- metadata (jsonb — sources, research summary, topics covered)
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
- agent_id (fk → user_agents.id)
- language (text) — language this job is generating for
- status (enum: pending, running, completed, failed)
- triggered_at
- completed_at
- error (text, nullable)

---

## 6. User-agent Catalog

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

For each active user-agent:
1. Has cadence interval passed since `last_run_at`?
2. Do any subscribers have fewer than 5 unread posts?

If both true → create one job per unique language among subscribers.

**Tier limits:** beta = max 10 user-agents, daily cadence only.

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
- Input: research brief, user-agent config, `prompt_config`, target language
- Write thread of 3-10 sub-posts
- Self-review using checklist
- Output: final sub-posts array + quality score

**Thread format:**
- Sub-post 1 (Hook): most surprising angle. Standalone. Max 280 chars.
- Sub-post 2 (Expansion): explains hook, unresolved tension. Max 280 chars.
- Sub-post 3+ (Depth): one idea per sub-post. Max 280 chars each.
- Second-to-last (Twist): flips perspective. Max 280 chars.
- Final (Landing): closes hook, one takeaway, leaves curiosity open. Max 280 chars.

**Writer voice rules (enforce in every prompt):**
- World's clearest thinker — deep expertise, first principles
- Use terminology freely but always earn it with a plain explanation
- Goal: make the reader feel smart, not sound smart
- Lead with the most surprising or counterintuitive thing
- No bullet points, no headers, no "In this post we will cover"
- One idea per sub-post, depth and personality
- Opinions welcome. Passive voice forbidden.
- If it sounds like Wikipedia, rewrite it.
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
- Input: user-agent config, full post history, curriculum pointers of all subscribers, `prompt_config`, target language
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

Weekly per user per user-agent:
1. Read like signals from past 4 weeks
2. Identify engagement patterns
3. Generate short instruction update (e.g. "User prefers geopolitical framing over economic data")
4. Merge into `prompt_config`

Never changes topic or type — only framing, angle, depth, style.
Model: claude-haiku

---

### Community Feed Logic

When fewer than 5 unread posts from own agents:
1. Query public agents with matching `topic_tags`
2. Filter: 10+ posts, quality_score > 0.7
3. Order by recent engagement
4. Label "From the community — [Name]"
5. After engagement → "Follow this user-agent?" with language selector

---

### Discover Page

Always ranked by: reliability score + avg likes + follower growth (last 30 days). Never alphabetical.

---

### Duplicate Detection

On user-agent creation:
1. Extract topic tags
2. Query matching public agents (same type + overlapping tags)
3. If strong match → suggest following instead
4. User chooses to follow existing or create new

---

## 8. UX & Design Principles

1. **Feed first.** Return to feed in one tap from anywhere.
2. **Mobile-first.** No hover states. Large tap targets.
3. **Invisible intelligence.** No prompts, model names, or errors visible to users.
4. **Expert voice.** First principles, terminology earned with plain explanation. Reader feels smart.
5. **Social media tone.** Punchy, opinionated. Never a lesson.
6. **Threads like Twitter.** Short punchy sub-posts. Each demands the next.
7. **Progress is subtle.** Curriculum label exists but never dominates.
8. **"Dig In" is consistent.** Always means: go to this agent's Posts tab on their profile page.
9. **Community content is labeled.** Blends naturally with a small clear label.
10. **Empty states are opportunities.** Never a dead end.
11. **Names are AI-generated and final.** Never show a name input field.
12. **Discover is ranked.** Always quality-ranked. Never alphabetical.
13. **Language is a subscription choice.** Selected when following. Default = browser language.

---

## 9. MVP Scope

### In Scope
- User auth (email/password via Supabase)
- User-agent creation and management (all 3 types)
- Two-step pipeline for all types
- Multilingual generation (language on subscription)
- Duplicate detection on creation
- Bottom sheet thread reader
- "Dig In" navigating to agent profile Posts tab
- Like signals (like and skip only)
- Community feed fallback
- Discover page with quality ranking
- Unified agent profile page with Info + Posts tabs
- Ask a question feature
- Scheduler (hourly), Personalization Loop (weekly)
- Pre-built templates (5+ per category)
- Beta tier limits (10 agents, daily cadence)
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
- DB tables: `user_agents` (snake_case)
- Code vars: `userAgent` (camelCase)
- Pipeline steps: `researcher`, `writer`
- Never use "agent" alone — always qualify

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
  /feed                        Feed and post card components
  /thread                      Bottom sheet thread reader
  /agent-profile               Unified agent profile page (Info + Posts tabs)
  /navigation                  Bottom tab bar, page header
  /agents                      User-agent management
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
  /types                       Shared TypeScript types
/hooks                         Custom React hooks
```

**Models:** `claude-sonnet-4-20250514` for Writer. `claude-haiku-4-5-20251001` for Researcher.

**Testing:** Tests for every pipeline step, scheduler logic, duplicate detection, and edge cases (empty history, first run, curriculum buffer end, multilingual jobs, breaking override). Run `npm test` before every commit.

**Git:** Commit after every working feature. Format: `[area] description`. Never commit broken code.

**Errors:** Pipeline failures logged to `jobs` table only — never shown to users.

---

## 11. Current Build State

**Completed:**
- ✅ Step 1 — Next.js 14 with Tailwind, Shadcn/ui, TypeScript
- ✅ Step 2 — Supabase connected, all tables migrated
- ⏳ Step 3 — Trigger.dev setup in progress
- ✅ Step 9 — Main feed UI (post cards with 3 tap zones, bottom sheet thread reader, bottom tab nav, dummy data)
- ✅ Step 10+12 — Unified agent profile page with Info + Posts tabs (replaces standalone rabbit hole + separate profile page)

**Remaining steps:**
3. Finish Trigger.dev setup
4. Build Layer 1 — Scheduler (one job per agent per language)
5. Build news pipeline — researcher.ts + writer-news.ts
6. Build learning pipeline — writer-learning.ts
7. Build recommendation pipeline — writer-recommendation.ts
8. Build Layer 3 — Personalization Loop
11. Build user-agent creation flow (language selection + duplicate detection)
13. Build discover page
14. Build community feed fallback
15. Build ask-a-question feature
16. End-to-end testing
17. Deploy to Vercel + add all environment variables

**Update this section every time a step is completed.**

---

*Last updated: Unified agent profile page replaces standalone rabbit hole. PostCard has 3 distinct tap zones. "Dig In" navigates to /agent/[agentId]?tab=posts. Tabs are Info (description + stats) and Posts (the rabbit hole). Claude Code must re-read this file at the start of every new session.*
