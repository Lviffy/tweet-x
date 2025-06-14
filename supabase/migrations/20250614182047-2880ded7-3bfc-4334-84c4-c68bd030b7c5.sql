
-- Create table for storing individual scraped tweets
CREATE TABLE public.scraped_tweets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL REFERENCES public.scraped_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_thread boolean DEFAULT false,
  has_emojis boolean DEFAULT false,
  hashtags text[] DEFAULT '{}',
  tweet_length integer NOT NULL,
  position integer DEFAULT 1,
  scraped_at timestamp with time zone NOT NULL,
  engagement_likes integer DEFAULT 0,
  engagement_retweets integer DEFAULT 0,
  engagement_replies integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scraped_tweets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies that inherit from the profile's user_id
CREATE POLICY "Users can view tweets from their profiles" 
  ON public.scraped_tweets 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.scraped_profiles 
      WHERE scraped_profiles.id = scraped_tweets.profile_id 
      AND scraped_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tweets for their profiles" 
  ON public.scraped_tweets 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.scraped_profiles 
      WHERE scraped_profiles.id = scraped_tweets.profile_id 
      AND scraped_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tweets from their profiles" 
  ON public.scraped_tweets 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.scraped_profiles 
      WHERE scraped_profiles.id = scraped_tweets.profile_id 
      AND scraped_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tweets from their profiles" 
  ON public.scraped_tweets 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.scraped_profiles 
      WHERE scraped_profiles.id = scraped_tweets.profile_id 
      AND scraped_profiles.user_id = auth.uid()
    )
  );

-- Create index for efficient querying
CREATE INDEX idx_scraped_tweets_profile_position ON public.scraped_tweets(profile_id, position);
