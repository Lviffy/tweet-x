
-- Create the scraped_profiles table
CREATE TABLE public.scraped_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  handle text NOT NULL,
  display_name text,
  bio text,
  verified boolean DEFAULT false,
  avatar_url text,
  writing_style_json jsonb,
  common_phrases text[],
  topic_areas text[],
  tweet_sample_count integer DEFAULT 0,
  average_tweet_length integer DEFAULT 0,
  thread_percentage integer DEFAULT 0,
  emoji_usage integer DEFAULT 0,
  last_scraped_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scraped_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own scraped profiles" 
  ON public.scraped_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scraped profiles" 
  ON public.scraped_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scraped profiles" 
  ON public.scraped_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scraped profiles" 
  ON public.scraped_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_scraped_profiles_user_handle ON public.scraped_profiles(user_id, handle);
