
-- Add the length column to the tweet_sessions table
ALTER TABLE public.tweet_sessions 
ADD COLUMN length text DEFAULT 'medium';

-- Update the column to have a check constraint for valid values
ALTER TABLE public.tweet_sessions 
ADD CONSTRAINT tweet_sessions_length_check 
CHECK (length IN ('short', 'medium', 'long'));
