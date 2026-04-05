-- Add depth preference to snippers
CREATE TYPE snipper_depth AS ENUM ('high_level', 'balanced', 'deep');

ALTER TABLE snippers
  ADD COLUMN depth snipper_depth NOT NULL DEFAULT 'balanced';
