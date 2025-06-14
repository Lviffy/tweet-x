
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GeneratedTweet {
  id: string;
  content: string;
  type: 'single' | 'thread';
}

interface TweetGenerationParams {
  handles: string[];
  topic: string;
  tone: string;
  format: string;
  includeHashtags: boolean;
  includeEmojis: boolean;
  includeCTA: boolean;
}

export const useTweetGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTweets, setGeneratedTweets] = useState<GeneratedTweet[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateTweets = async (params: TweetGenerationParams) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate tweets.",
        variant: "destructive"
      });
      return null;
    }

    const { handles, topic, tone, format, includeHashtags, includeEmojis, includeCTA } = params;

    if (!topic.trim() || !tone || handles.some(h => !h.trim())) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return null;
    }

    setIsGenerating(true);
    
    try {
      // Create session in database
      const { data: session, error: sessionError } = await supabase
        .from('tweet_sessions')
        .insert({
          user_id: user.id,
          title: `${topic.slice(0, 50)}...`,
          handles: handles.filter(h => h.trim()),
          topic,
          tone,
          format,
          include_hashtags: includeHashtags,
          include_emojis: includeEmojis,
          include_cta: includeCTA
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Call the edge function to generate tweets
      const { data, error } = await supabase.functions.invoke('generate-tweets', {
        body: {
          handles: handles.filter(h => h.trim()),
          topic,
          tone,
          format,
          includeHashtags,
          includeEmojis,
          includeCTA
        }
      });

      if (error) throw error;

      const tweets = data.tweets as GeneratedTweet[];

      // Save generated tweets to database
      const tweetsToInsert = tweets.map((tweet, index) => ({
        session_id: session.id,
        content: tweet.content,
        type: tweet.type,
        position: index
      }));

      const { error: tweetsError } = await supabase
        .from('generated_tweets')
        .insert(tweetsToInsert);

      if (tweetsError) throw tweetsError;

      setGeneratedTweets(tweets);
      
      toast({
        title: "Tweets Generated!",
        description: "Your AI-generated tweets are ready."
      });

      return session.id;
    } catch (error) {
      console.error('Tweet generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again. Make sure you have a stable internet connection.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const { data: tweets, error } = await supabase
        .from('generated_tweets')
        .select('id, content, type')
        .eq('session_id', sessionId)
        .order('position');

      if (error) throw error;

      setGeneratedTweets(tweets || []);
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error",
        description: "Failed to load session.",
        variant: "destructive"
      });
    }
  };

  return {
    isGenerating,
    generatedTweets,
    generateTweets,
    loadSession,
    setGeneratedTweets
  };
};
