
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
      // Create a new session
      const { data: sessionData, error: sessionError } = await supabase
        .from('tweet_sessions')
        .insert([{
          user_id: user.id,
          title: `${topic} - ${new Date().toLocaleDateString()}`
        }])
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        throw sessionError;
      }

      // Call the Gemini AI Edge Function
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('generate-tweets', {
        body: {
          handles,
          topic,
          tone,
          format,
          includeHashtags,
          includeEmojis,
          includeCTA
        }
      });

      if (aiError) {
        console.error('Error calling AI function:', aiError);
        throw new Error('Failed to generate tweets with AI');
      }

      if (!aiResponse || !aiResponse.tweets) {
        throw new Error('Invalid response from AI service');
      }

      // Save generated tweets to database
      const tweetsToInsert = aiResponse.tweets.map((tweet: GeneratedTweet, index: number) => ({
        session_id: sessionData.id,
        content: tweet.content,
        type: tweet.type,
        position: index + 1
      }));

      const { data: tweetsData, error: tweetsError } = await supabase
        .from('generated_tweets')
        .insert(tweetsToInsert)
        .select();

      if (tweetsError) {
        console.error('Error saving tweets:', tweetsError);
        throw tweetsError;
      }

      const generatedTweets: GeneratedTweet[] = tweetsData.map(tweet => ({
        id: tweet.id,
        content: tweet.content,
        type: tweet.type as 'single' | 'thread'
      }));

      setGeneratedTweets(generatedTweets);
      
      toast({
        title: "Tweets Generated!",
        description: "Your AI-generated tweets are ready."
      });

      return sessionData.id;
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
      // Load tweets for the session
      const { data: tweetsData, error: tweetsError } = await supabase
        .from('generated_tweets')
        .select('*')
        .eq('session_id', sessionId)
        .order('position', { ascending: true });

      if (tweetsError) {
        console.error('Error loading tweets:', tweetsError);
        throw tweetsError;
      }

      const tweets: GeneratedTweet[] = tweetsData?.map(tweet => ({
        id: tweet.id,
        content: tweet.content,
        type: tweet.type as 'single' | 'thread'
      })) || [];

      setGeneratedTweets(tweets);
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
