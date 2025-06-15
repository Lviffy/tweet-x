
-- Add a starred column to generated_tweets (default: false)
ALTER TABLE public.generated_tweets
ADD COLUMN IF NOT EXISTS starred boolean NOT NULL DEFAULT false;

-- Enable RLS if not already enabled
ALTER TABLE public.generated_tweets ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own tweets
CREATE POLICY "Allow user select own generated_tweets"
  ON public.generated_tweets
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tweet_sessions s
    WHERE s.id = generated_tweets.session_id AND s.user_id = auth.uid()
  ));

-- Allow users to update their own tweets (for starring)
CREATE POLICY "Allow user update own generated_tweets"
  ON public.generated_tweets
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM tweet_sessions s
    WHERE s.id = generated_tweets.session_id AND s.user_id = auth.uid()
  ));

-- Allow users to insert their own tweets (already covered most likely, but for completeness)
CREATE POLICY "Allow user insert own generated_tweets"
  ON public.generated_tweets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tweet_sessions s
      WHERE s.id = generated_tweets.session_id AND s.user_id = auth.uid()
    )
  );
