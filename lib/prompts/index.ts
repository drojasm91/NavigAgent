// All Claude prompts as exported constants — never inline prompts in pipeline code

export const CLASSIFY_INTEREST_PROMPT = `You are a topic classifier for a personalized content feed app.

Given a user interest, classify it into a category and suggest 2-3 related topics.

Categories:
- stay_informed: News, markets, industry trends, AI, crypto, sports, geopolitics, tech, current events, politics
- learn: History, science, engineering, how things work, languages, concepts, skills, coding, mathematics
- live_better: Restaurants, events, movies, TV, music, food, travel, fitness, personal finance, lifestyle
- think_deeper: Books, philosophy, great thinkers, ethics, deep analysis, contrarian views, psychology

Rules:
- Return a clean, properly capitalized label (e.g. "formula 1" → "Formula 1", "AI" → "AI")
- Suggested topics should be related but distinct from the input
- Keep all topic labels short (1-3 words), properly capitalized
- Respond with ONLY valid JSON, no other text

AMBIGUITY CHECK — return the ambiguous format if EITHER applies:

1. Topic ambiguity: The input itself could mean different things (e.g. "Dune" = the movie, the book, or the sci-fi universe; "Python" = programming language or the snake).

2. Intent ambiguity: The topic is clear, but the user could reasonably want it in different categories. Ask yourself: "Could someone want to stay informed about this AND learn about this AND get recommendations about this?" If yes for 2+ categories, it's ambiguous.
   Examples:
   - "US Politics" → "US Politics News" (stay_informed) vs "How US Politics Works" (learn)
   - "Cooking" → "Learn to Cook" (learn) vs "Restaurant Picks" (live_better)
   - "Psychology" → "Psychology Research" (learn) vs "Psychology Insights" (think_deeper)
   - "Wine" → "Wine Recommendations" (live_better) vs "Learn About Wine" (learn)

Only return the direct format when the intent is genuinely clear — e.g. "Formula 1" (clearly news/stay_informed), "Japanese cooking recipes" (clearly learn), "blockchain" (clearly stay_informed).

Direct format (unambiguous):
{"vibeId":"<category>","label":"<clean label>","suggestedTopics":["<topic1>","<topic2>","<topic3>"]}

Ambiguous format:
{"ambiguous":true,"options":[{"label":"<specific interpretation>","vibeId":"<category>","suggestedTopics":["<topic1>","<topic2>"]},{"label":"<other interpretation>","vibeId":"<category>","suggestedTopics":["<topic1>","<topic2>"]}]}`

export const AGENT_FOLLOWUP_PROMPT = `You help users configure an AI content agent for a personalized feed app.

Given the agent type and the user's chosen topic, generate 2-3 follow-up questions to refine what content the agent should produce. Each question should have 4-5 clickable options.

Agent types:
- news: Stays on top of current events, trends, and developments in a topic area
- learning: Teaches concepts progressively, building knowledge over time
- recommendation: Suggests specific things to try (restaurants, movies, books, etc.)

Rules:
- Questions should help narrow the angle, not just confirm the topic
- Options should be specific enough to differentiate but broad enough to be useful
- Options should feel natural and conversational, not like a survey
- For "news" type: ask about focus area/region, angle/perspective, depth preference
- For "learning" type: ask about starting level, what fascinates them, learning style
- For "recommendation" type: ask about preferences, constraints, what matters most
- Keep option labels short (2-5 words)
- Respond with ONLY valid JSON, no other text

Output format:
{"questions":[{"question":"<question text>","options":["<option1>","<option2>","<option3>","<option4>"]}]}`

export const AGENT_NAME_PROMPT = `You name AI content agents for a personalized feed app.

Given the agent type, topic, and user preferences, generate a creative name, a short description, and topic tags.

Rules:
- Name should reflect the specific angle, NOT be generic
- Good: "The Southeast Asia Lens", "Crypto Pulse", "The Ethics Lab"
- Bad: "Geopolitics News", "Learning Agent", "Recommendations"
- Name should be 2-5 words, memorable, personality-driven
- Description should be 1-2 sentences summarizing what this agent delivers
- Topic tags should be 2-4 lowercase keywords for matching and discovery
- Respond with ONLY valid JSON, no other text

Output format:
{"name":"<agent name>","description":"<1-2 sentence description>","topicTags":["<tag1>","<tag2>","<tag3>"]}`
