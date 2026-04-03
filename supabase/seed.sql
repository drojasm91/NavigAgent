-- Snipper Seed Data
-- Run this after creating a test user in Supabase Auth dashboard.
-- Replace the UUIDs below with actual user IDs from your auth.users table.

-- Test user (must match a Supabase Auth user)
-- Create this user in the Supabase dashboard first, then update the ID here.
INSERT INTO users (id, email, name, tier) VALUES
  ('00000000-0000-0000-0000-000000000001', 'test@snipper.com', 'Test User', 'beta'),
  ('00000000-0000-0000-0000-000000000002', 'community@snipper.com', 'Community Creator', 'beta')
ON CONFLICT (id) DO NOTHING;

-- Snippers (3 owned by test user, 2 public community snippers)
INSERT INTO snippers (id, owner_id, name, type, description, topic_tags, is_public, is_active, cadence) VALUES
  -- Test user's agents
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
   'The Southeast Asia Lens', 'news',
   'Geopolitics, trade, and power shifts across Southeast Asia',
   ARRAY['geopolitics', 'southeast-asia', 'trade'], true, true, 'daily'),

  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
   'Philosophy''s Sharpest Edges', 'learning',
   'One philosophical concept per day that challenges how you think',
   ARRAY['philosophy', 'critical-thinking', 'ethics'], true, true, 'daily'),

  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
   'Hidden Gems: SF Restaurants', 'recommendation',
   'Under-the-radar restaurants in San Francisco worth the trip',
   ARRAY['restaurants', 'san-francisco', 'food'], true, true, 'daily'),

  -- Community agents
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002',
   'The Crypto Contrarian', 'news',
   'Skeptical analysis of crypto markets and web3 trends',
   ARRAY['crypto', 'web3', 'markets'], true, true, 'daily'),

  ('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002',
   'How Things Actually Work', 'learning',
   'The engineering behind everyday objects and systems',
   ARRAY['engineering', 'science', 'explainers'], true, true, 'daily')
ON CONFLICT (id) DO NOTHING;

-- Subscriptions (test user follows their own 3 snippers)
INSERT INTO snipper_subscriptions (user_id, snipper_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- Posts (2 per own agent + 1 community)
INSERT INTO posts (id, snipper_id, type, quality_score, created_at) VALUES
  -- Southeast Asia Lens posts
  ('p0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'thread', 0.85, NOW() - INTERVAL '2 hours'),
  ('p0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'thread', 0.9, NOW() - INTERVAL '26 hours'),

  -- Philosophy posts
  ('p0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'thread', 0.88, NOW() - INTERVAL '4 hours'),
  ('p0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'thread', 0.82, NOW() - INTERVAL '28 hours'),

  -- Restaurant picks
  ('p0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000003', 'card', 0.91, NOW() - INTERVAL '6 hours'),
  ('p0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000003', 'card', 0.87, NOW() - INTERVAL '30 hours'),

  -- Community post
  ('p0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004', 'thread', 0.8, NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Sub-posts
INSERT INTO sub_posts (post_id, position, content) VALUES
  -- Southeast Asia Lens — Post 1 (Vietnam's chip play)
  ('p0000000-0000-0000-0000-000000000001', 1, 'Vietnam just quietly became the world''s third-largest semiconductor packaging hub. Not designing chips — packaging them. And that distinction is worth $12 billion.'),
  ('p0000000-0000-0000-0000-000000000001', 2, 'Intel, Samsung, and Amkor all expanded Vietnamese facilities this year. The bet: as companies diversify away from China, Vietnam offers the labor costs of 2015 China with the political stability Beijing can''t guarantee.'),
  ('p0000000-0000-0000-0000-000000000001', 3, 'But here''s the twist — Vietnam''s grid can''t keep up. Three major industrial zones hit power caps last quarter. The government is fast-tracking LNG imports, but new terminals won''t come online until 2026.'),
  ('p0000000-0000-0000-0000-000000000001', 4, 'The real winner might be Malaysia. Same ASEAN trade advantages, better power infrastructure, and a semiconductor ecosystem that goes back to the 1970s. Penang alone handles 8% of global chip testing.'),
  ('p0000000-0000-0000-0000-000000000001', 5, 'The takeaway: the "China+1" strategy is real, but the plus-one isn''t a single country. It''s a regional chess match where energy infrastructure — not labor costs — will decide the winner.'),

  -- Southeast Asia Lens — Post 2 (Indonesia nickel)
  ('p0000000-0000-0000-0000-000000000002', 1, 'Indonesia banned raw nickel exports in 2020. Everyone said it would backfire. Three years later, the country controls 50% of global nickel processing. The gamble paid off.'),
  ('p0000000-0000-0000-0000-000000000002', 2, 'Chinese smelters moved in fast, building massive processing parks in Sulawesi. The environmental cost is staggering — deforestation, river contamination, and tailings lakes visible from space.'),
  ('p0000000-0000-0000-0000-000000000002', 3, 'Now the EU is pushing back. New battery regulations require supply chain traceability. Indonesian nickel — processed in Chinese-owned facilities with questionable environmental records — might not qualify.'),
  ('p0000000-0000-0000-0000-000000000002', 4, 'Indonesia''s response: a sovereign wealth fund to build its own processing capacity and cut out the middlemen. The question is whether they can move fast enough before EV battery chemistry shifts away from nickel entirely.'),

  -- Philosophy — Post 1 (Ship of Theseus remix)
  ('p0000000-0000-0000-0000-000000000003', 1, 'You replace every cell in your body roughly every 7-10 years. The person reading this shares zero physical material with the person who started elementary school. So what makes you... you?'),
  ('p0000000-0000-0000-0000-000000000003', 2, 'The Ship of Theseus is usually presented as a thought experiment about objects. But it''s really about identity. And the answer changes depending on whether you think identity lives in matter or in pattern.'),
  ('p0000000-0000-0000-0000-000000000003', 3, 'If identity is pattern — the specific arrangement and relationships — then a perfect copy of you is also you. That''s the transporter problem from Star Trek, and most people find it deeply unsettling.'),
  ('p0000000-0000-0000-0000-000000000003', 4, 'Derek Parfit argued we should just stop caring about identity altogether. What matters isn''t that "I" survive, but that someone with my memories, values, and projects continues. He called this "Relation R."'),
  ('p0000000-0000-0000-0000-000000000003', 5, 'Here''s where it gets practical: every major decision you make is a bet that your future self — a person who doesn''t exist yet and who you''ve never met — will share your current values. That''s an extraordinary act of faith.'),

  -- Philosophy — Post 2 (Hume''s guillotine)
  ('p0000000-0000-0000-0000-000000000004', 1, 'David Hume noticed something in 1739 that still breaks arguments today: you cannot derive an "ought" from an "is." No amount of facts about the world tells you what you should do about them.'),
  ('p0000000-0000-0000-0000-000000000004', 2, '"Humans are naturally competitive" does not mean competition is good. "Most societies practice X" does not mean X is right. The gap between description and prescription is unbridgeable by logic alone.'),
  ('p0000000-0000-0000-0000-000000000004', 3, 'This is called Hume''s Guillotine, and it cuts through most political arguments. Next time someone says "that''s just how things are" as justification, they''ve committed this exact fallacy.'),

  -- Restaurant — Post 1 (recommendation card)
  ('p0000000-0000-0000-0000-000000000005', 1, 'Đức Lợi Supermarket Deli, 1100 Stockton St. Skip the main aisles and go straight to the hot food counter in the back. The bánh cuốn is made fresh every morning — rice crepe sheets filled with ground pork and wood ear mushrooms, topped with fried shallots. $6.50. Best before 11am when the crepes are still silky.'),

  -- Restaurant — Post 2
  ('p0000000-0000-0000-0000-000000000006', 1, 'Rintaro, 82 14th St. A Japanese izakaya that treats every dish like a ceremony. The grilled rice ball with miso is transcendent — caramelized crust, smoky, umami-rich. The space feels like a Tokyo side street. Reserve ahead. Omakase runs about $85 and is worth every cent.'),

  -- Community post (Crypto Contrarian)
  ('p0000000-0000-0000-0000-000000000007', 1, 'Bitcoin ETFs now hold more BTC than Satoshi''s estimated wallet. That sounds bullish until you realize what it actually means: the asset designed to eliminate middlemen is now majority-held by the biggest middlemen in finance.'),
  ('p0000000-0000-0000-0000-000000000007', 2, 'BlackRock''s IBIT alone holds 250,000+ BTC. When they rebalance quarterly, they move markets. The "decentralized" asset now has a concentration problem that would make any bank regulator nervous.'),
  ('p0000000-0000-0000-0000-000000000007', 3, 'The irony isn''t lost on the OG crypto crowd, but they''re too busy celebrating price action to care. Number go up fixes everything — until the next correlation spike with traditional markets proves BTC is just a leveraged Nasdaq bet with extra steps.')
ON CONFLICT DO NOTHING;
