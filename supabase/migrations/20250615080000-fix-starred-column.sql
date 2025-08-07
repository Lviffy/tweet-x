-- Ensure the starred column exists and has the correct structure
-- This migration fixes any potential issues with the starred column

-- First, check if the starred column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'generated_tweets' 
        AND column_name = 'starred'
    ) THEN
        ALTER TABLE public.generated_tweets ADD COLUMN starred boolean NOT NULL DEFAULT false;
    END IF;
END $$;

-- Ensure the starred column has the correct default value
ALTER TABLE public.generated_tweets 
ALTER COLUMN starred SET DEFAULT false;

-- Ensure the starred column is NOT NULL
ALTER TABLE public.generated_tweets 
ALTER COLUMN starred SET NOT NULL;

-- Update any existing NULL values to false
UPDATE public.generated_tweets 
SET starred = false 
WHERE starred IS NULL;

-- Ensure RLS is enabled
ALTER TABLE public.generated_tweets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow user select own generated_tweets" ON public.generated_tweets;
DROP POLICY IF EXISTS "Allow user update own generated_tweets" ON public.generated_tweets;
DROP POLICY IF EXISTS "Allow user insert own generated_tweets" ON public.generated_tweets;
DROP POLICY IF EXISTS "Users can view tweets from their sessions" ON public.generated_tweets;
DROP POLICY IF EXISTS "Users can create tweets in their sessions" ON public.generated_tweets;
DROP POLICY IF EXISTS "Users can update tweets in their sessions" ON public.generated_tweets;
DROP POLICY IF EXISTS "Users can delete tweets from their sessions" ON public.generated_tweets;

-- Recreate the policies with proper syntax
CREATE POLICY "Allow user select own generated_tweets"
  ON public.generated_tweets
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tweet_sessions s
    WHERE s.id = generated_tweets.session_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Allow user update own generated_tweets"
  ON public.generated_tweets
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM tweet_sessions s
    WHERE s.id = generated_tweets.session_id AND s.user_id = auth.uid()
  ));

CREATE POLICY "Allow user insert own generated_tweets"
  ON public.generated_tweets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tweet_sessions s
      WHERE s.id = generated_tweets.session_id AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow user delete own generated_tweets"
  ON public.generated_tweets
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM tweet_sessions s
    WHERE s.id = generated_tweets.session_id AND s.user_id = auth.uid()
  )); 