
-- Create the tweet_sessions table to store user tweet generation sessions
CREATE TABLE public.tweet_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create the generated_tweets table to store individual tweets
CREATE TABLE public.generated_tweets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.tweet_sessions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'single' CHECK (type IN ('single', 'thread')),
  position INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tweet_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_tweets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tweet_sessions
CREATE POLICY "Users can view their own sessions" 
  ON public.tweet_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
  ON public.tweet_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
  ON public.tweet_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
  ON public.tweet_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for generated_tweets
CREATE POLICY "Users can view tweets from their sessions" 
  ON public.generated_tweets 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.tweet_sessions 
    WHERE tweet_sessions.id = generated_tweets.session_id 
    AND tweet_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create tweets in their sessions" 
  ON public.generated_tweets 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.tweet_sessions 
    WHERE tweet_sessions.id = generated_tweets.session_id 
    AND tweet_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can update tweets in their sessions" 
  ON public.generated_tweets 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.tweet_sessions 
    WHERE tweet_sessions.id = generated_tweets.session_id 
    AND tweet_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tweets from their sessions" 
  ON public.generated_tweets 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.tweet_sessions 
    WHERE tweet_sessions.id = generated_tweets.session_id 
    AND tweet_sessions.user_id = auth.uid()
  ));
