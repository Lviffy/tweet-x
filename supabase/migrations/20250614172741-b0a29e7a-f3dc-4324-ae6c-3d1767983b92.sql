
-- Add columns to store form parameters in tweet_sessions table
ALTER TABLE public.tweet_sessions 
ADD COLUMN handles TEXT[] DEFAULT '{}',
ADD COLUMN topic TEXT DEFAULT '',
ADD COLUMN tone TEXT DEFAULT '',
ADD COLUMN format TEXT DEFAULT 'single',
ADD COLUMN tweet_count INTEGER DEFAULT 3,
ADD COLUMN include_hashtags BOOLEAN DEFAULT false,
ADD COLUMN include_emojis BOOLEAN DEFAULT false,
ADD COLUMN include_cta BOOLEAN DEFAULT false;
